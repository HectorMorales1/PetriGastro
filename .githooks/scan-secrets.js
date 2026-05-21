#!/usr/bin/env node
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const RED = '\x1b[0;31m'
const YELLOW = '\x1b[1;33m'
const GREEN = '\x1b[0;32m'
const CYAN = '\x1b[0;36m'
const NC = '\x1b[0m'

const HIGH_RISK_PATTERNS = [
  { pattern: /password\s*[:=]\s*["']?[^"'\s]{6,}["']?/, name: 'password' },
  { pattern: /secret\s*[:=]\s*["']?[^"'\s]{6,}["']?/, name: 'secret' },
  { pattern: /api[_-]?key\s*[:=]\s*["']?[^"'\s]{8,}["']?/, name: 'api_key' },
  { pattern: /api[_-]?secret\s*[:=]\s*["']?[^"'\s]{8,}["']?/, name: 'api_secret' },
  { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key' },
  { pattern: /-----BEGIN (RSA|OPENSSH|DSA|EC) PRIVATE KEY-----/, name: 'Private Key' },
  { pattern: /JWT_SECRET\s*[:=]/, name: 'JWT Secret' },
  { pattern: /ghp_[0-9A-Za-z]{36,}/, name: 'GitHub Personal Token' },
  { pattern: /gho_[0-9A-Za-z]{36,}/, name: 'GitHub OAuth Token' },
  { pattern: /xox[parb]-[0-9A-Za-z-]{24,}/, name: 'Slack Token' },
  { pattern: /sk-[0-9A-Za-z]{20,}/, name: 'API Key (Stripe/OpenAI)' },
  { pattern: /postgres:\/\/\w+:\w+@/, name: 'DB URL with credentials' },
  { pattern: /mysql:\/\/\w+:\w+@/, name: 'MySQL URL with credentials' },
  { pattern: /redis:\/\/:\w+@/, name: 'Redis URL with credentials' },
]

const BLOCKED_FILES = [
  /^\.env$/, /\/\.env$/,
  /\.key$/, /\.pem$/,
  /secrets\.yml$/, /credentials\.json$/,
]

const IGNORE_PATHS = [
  /node_modules/, /\.git\//,
  /\.(png|jpg|jpeg|gif|ico|svg|woff2?|eot|ttf|otf|pdf|zip|gz|lock)$/,
  /\.(example|sample)\./,
  /(\/|^)test\//, /(\/|^)__tests__\//, /(\/|^)spec\//, /\/mock/, /\/fixture/,
]

function getStagedFiles() {
  const output = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
  return output.split('\n').filter(Boolean)
}

function getStagedContent(file) {
  try {
    return execSync(`git show :${file}`, { encoding: 'utf8' })
  } catch {
    return ''
  }
}

function isIgnored(file) {
  return IGNORE_PATHS.some(p => p.test(file))
}

function isBlockedFile(file) {
  return BLOCKED_FILES.some(p => p.test(file))
}

function checkForSecrets(file, content) {
  if (isIgnored(file)) return []
  const findings = []
  const lines = content.split('\n')
  lines.forEach((line, idx) => {
    for (const { pattern, name } of HIGH_RISK_PATTERNS) {
      if (pattern.test(line)) {
        if (/process\.env|import\.meta\.env/.test(line)) continue
        if (/["']\s*["']|null|undefined/.test(line)) continue
        if (/\b(password|secret|api[_-]?key|token)\s*[:=]\s*(string|number|boolean|null|undefined|any)\b/.test(line)) continue
        findings.push({ line: idx + 1, text: line.trim(), name })
        break
      }
    }
  })
  return findings
}

async function main() {
  console.log(`\n${CYAN}━━━ Secret Scanner ━━━${NC}\n`)

  const files = getStagedFiles()
  if (files.length === 0) {
    console.log(`${GREEN}✓ No hay archivos staged para escanear${NC}`)
    process.exit(0)
  }

  let blocked = false
  const allFindings = []

  for (const file of files) {
    // Check for blocked files (like .env)
    if (isBlockedFile(file) && !/\.env\.(example|sample)/.test(file)) {
      console.log(`${RED}⛔ BLOQUEADO:${NC} Archivo sensible '${file}' está en staged`)
      try {
        execSync(`git rm --cached "${file}"`, { stdio: 'ignore' })
        const gitignorePath = path.join(process.cwd(), '.gitignore')
        let gitignore = ''
        try { gitignore = fs.readFileSync(gitignorePath, 'utf8') } catch {}
        if (!gitignore.includes('.env')) {
          fs.appendFileSync(gitignorePath, '\n# Environment file\n.env\n')
          execSync('git add .gitignore', { stdio: 'ignore' })
        }
      } catch {}
      blocked = true
      continue
    }

    // Scan file content
    const content = getStagedContent(file)
    const findings = checkForSecrets(file, content)
    if (findings.length > 0) {
      blocked = true
      allFindings.push({ file, findings })
      for (const f of findings) {
        console.log(`${RED}🔴 ALERTA:${NC} Posible ${YELLOW}${f.name}${NC} en ${CYAN}${file}${NC}:${YELLOW}${f.line}${NC}`)
        console.log(`  ${f.text}\n`)
      }
    }
  }

  if (blocked) {
    console.log(`\n${RED}━━━ COMMIT BLOQUEADO ━━━${NC}`)
    console.log(`\n${YELLOW}Se detectaron datos sensibles en los cambios.${NC}`)
    console.log(`\n${CYAN}Para resolver:${NC}`)
    console.log('  1. Revisa los archivos indicados arriba')
    console.log('  2. Reemplaza valores sensibles con variables de entorno:')
    console.log('     process.env.MI_VARIABLE en vez de valores hardcodeados')
    console.log('  3. Si es falso positivo, usa --no-verify:')
    console.log('     git commit --no-verify -m "mensaje"')
    process.exit(1)
  }

  console.log(`${GREEN}✓ No se detectaron datos sensibles${NC}`)
  process.exit(0)
}

main().catch(err => {
  console.error(`${RED}Error en Secret Scanner:${NC}`, err.message)
  process.exit(0)
})
