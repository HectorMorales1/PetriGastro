import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const sections = {
  privacidad: {
    title: 'Política de Privacidad',
    content: [
      {
        title: '1. Responsable del Tratamiento',
        text: 'PetriGastro (en adelante, "el Responsable"), con domicilio en Calle Gourmet, 123, 28001 Madrid, España, y correo electrónico hola@petrigastro.es, es el responsable del tratamiento de los datos personales recabados a través del sitio web petrigastro.es.'
      },
      {
        title: '2. Base Legal del Tratamiento',
        text: 'El tratamiento de sus datos se realiza en base a las siguientes bases legales:\n\n• Ejecución de un contrato: para la gestión de pedidos, reservas y la prestación de los servicios solicitados.\n• Consentimiento del interesado: para el envío de comunicaciones comerciales y la publicación de opiniones.\n• Interés legítimo: para la mejora de nuestros servicios y la prevención del fraude.\n• Cumplimiento de obligaciones legales: conforme a la normativa fiscal y mercantil aplicable.'
      },
      {
        title: '3. Fines del Tratamiento',
        text: 'Sus datos personales serán tratados con las siguientes finalidades:\n\n• Gestión integral de pedidos: procesar, confirmar y gestionar los pedidos realizados a través de la plataforma.\n• Creación y mantenimiento de cuenta de usuario: gestionar su registro, autenticación y perfil.\n• Comunicaciones relacionadas con el servicio: notificarle sobre el estado de sus pedidos, cambios en los mismos o incidencias.\n• Envío de comunicaciones comerciales: previo consentimiento expreso, informarle sobre novedades, ofertas y promociones.\n• Atención al cliente: resolver dudas, reclamaciones o incidencias.\n• Cumplimiento de obligaciones legales: facturación, conservación de documentos y atención a requerimientos de autoridades.'
      },
      {
        title: '4. Categorías de Datos Recabados',
        text: 'Las categorías de datos que recabamos son:\n\n• Datos identificativos: nombre, apellidos, dirección de correo electrónico, teléfono.\n• Datos de acceso: credenciales de usuario (email y contraseña cifrada).\n• Datos de pedidos: productos seleccionados, fecha de recogida, historial de compras.\n• Datos de navegación: dirección IP, tipo de navegador, páginas visitadas, tiempo de sesión.\n• Datos de pago: en caso de implementarse pagos online, los datos serán procesados directamente por la pasarela de pago sin que el Responsable tenga acceso a datos bancarios completos.\n• Opiniones y valoraciones: comentarios y calificaciones sobre los productos.'
      },
      {
        title: '5. Plazo de Conservación',
        text: 'Los datos personales se conservarán:\n\n• Mientras se mantenga la relación contractual o el usuario no solicite su baja.\n• Durante el plazo necesario para cumplir con obligaciones legales (especialmente fiscales y mercantiles), que en España es de 5 años para datos contractuales y 10 años para datos fiscales.\n• Las comunicaciones comerciales se conservarán hasta que el usuario revoque su consentimiento.\n• Los datos de navegación se conservarán durante un máximo de 12 meses.'
      },
      {
        title: '6. Destinatarios y Cesiones',
        text: 'Sus datos no serán cedidos a terceros salvo obligación legal o cuando sea necesario para la prestación del servicio:\n\n• Proveedores de servicios de hosting y cloud computing (con sede en la UE).\n• Pasarelas de pago (en caso de implementarse).\n• Fuerzas y cuerpos de seguridad, en cumplimiento de requerimientos legales.\n• No se realizan transferencias internacionales de datos fuera del Espacio Económico Europeo.'
      },
      {
        title: '7. Derechos del Usuario',
        text: 'De acuerdo con el RGPD y la LOPDGDD, el usuario tiene derecho a:\n\n• Acceso: conocer qué datos tratamos y cómo los usamos.\n• Rectificación: solicitar la corrección de datos inexactos.\n• Supresión (derecho al olvido): solicitar la eliminación de sus datos cuando ya no sean necesarios.\n• Limitación del tratamiento: solicitar que se restrinja el procesamiento de sus datos.\n• Portabilidad: recibir sus datos en un formato estructurado y transmitirlos a otro responsable.\n• Oposición: oponerse al tratamiento de sus datos para fines de marketing directo.\n• Retirada del consentimiento: en cualquier momento, sin que afecte a la licitud del tratamiento previo.\n\nPara ejercer estos derechos, envíe un correo a hola@petrigastro.es indicando el derecho que desea ejercer, junto con copia de su DNI o documento identificativo. Responderemos en un plazo máximo de 30 días.'
      },
      {
        title: '8. Medidas de Seguridad',
        text: 'El Responsable adopta las medidas técnicas y organizativas necesarias para garantizar la seguridad e integridad de los datos personales, incluyendo:\n\n• Cifrado de contraseñas mediante tecnología bcrypt.\n• Protocolo HTTPS para la transmisión segura de datos.\n• Firewalls y sistemas de detección de intrusiones.\n• Acceso restringido a los datos por personal autorizado.\n• Copias de seguridad periódicas.\n• Medidas de seudonimización cuando sea aplicable.'
      },
      {
        title: '9. Política de Cookies',
        text: 'Este sitio web utiliza cookies propias y de terceros para mejorar la experiencia de navegación y analizar el tráfico del sitio. Las cookies estrictamente necesarias para el funcionamiento del sitio están siempre activas. Las cookies de análisis y preferencias requieren su consentimiento.\n\nPuede configurar, rechazar o aceptar las cookies en cualquier momento a través del panel de configuración de cookies disponible en el sitio web.'
      },
      {
        title: '10. Redes Sociales',
        text: 'El Responsable mantiene perfiles en redes sociales (Instagram, Facebook, Telegram). El tratamiento de datos de los seguidores en dichas redes se rige por las políticas de privacidad de cada plataforma. El Responsable tratará los datos de los seguidores únicamente para la gestión de su presencia en redes sociales y la atención de consultas.'
      },
      {
        title: '11. Ejercicio de Derechos ante la AEPD',
        text: 'Si considera que no se ha tratado adecuadamente sus datos, puede presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) a través de su sede electrónica (www.aepd.es) o en la dirección C/ Jorge Juan, 6, 28001 Madrid.'
      },
      {
        title: '12. Actualizaciones',
        text: 'Esta política de privacidad fue actualizada por última vez el 1 de enero de 2026. El Responsable se reserva el derecho de modificar esta política para adaptarla a novedades legislativas o jurisprudenciales. Se recomienda al usuario revisar periódicamente esta página.'
      }
    ]
  },
  condiciones: {
    title: 'Términos y Condiciones',
    content: [
      {
        title: '1. Información General',
        text: 'Las presentes Condiciones Generales regulan el uso del sitio web petrigastro.es y la contratación de productos y servicios ofrecidos por PetriGastro (Calle Gourmet, 123, 28001 Madrid, España, CIF/NIF pendiente de asignación). El acceso y uso del sitio web atribuye la condición de usuario e implica la aceptación plena de estas condiciones.'
      },
      {
        title: '2. Registro de Usuario',
        text: 'Para realizar pedidos es necesario registrarse como usuario. El usuario se compromete a:\n\n• Proporcionar datos veraces y mantenerlos actualizados.\n• No utilizar identidades falsas ni suplantar a terceros.\n• Mantener la confidencialidad de sus credenciales de acceso.\n• Notificar inmediatamente cualquier uso no autorizado de su cuenta.\n\nEl registro está sujeto a verificación de email y aprobación por parte del administrador.'
      },
      {
        title: '3. Proceso de Pedido',
        text: 'El proceso de pedido se realiza a través del carrito de compras y sigue estos pasos:\n\n1. Selección de productos del menú disponible.\n2. Configuración de fecha y hora de recogida.\n3. Confirmación del pedido y aceptación de estas condiciones.\n4. Recepción del número de pedido como confirmación.\n\nLos precios se muestran con IVA incluido. El Responsable se reserva el derecho de modificar los precios en cualquier momento, si bien los pedidos ya confirmados se respetarán al precio acordado.'
      },
      {
        title: '4. Recogida de Pedidos',
        text: 'Los pedidos deben recogerse en la fecha y hora seleccionadas durante el proceso de compra. El Responsable no se hace responsable por la pérdida o deterioro del producto si no es recogido en el horario establecido. El usuario puede modificar la fecha/hora de recogida contactando con el establecimiento con al menos 2 horas de antelación.'
      },
      {
        title: '5. Cancelación y Devoluciones',
        text: 'Los pedidos pueden cancelarse siempre que no hayan pasado al estado "preparando". Para cancelar un pedido, el usuario debe acceder a "Mis Pedidos" y solicitar la cancelación. Una vez que el pedido está en preparación, no se aceptarán cancelaciones.\n\nEn caso de incidencia con la calidad del producto, el usuario deberá notificarlo en un plazo máximo de 2 horas tras la recogida para su evaluación.'
      },
      {
        title: '6. Responsabilidad',
        text: 'El Responsable no será responsable por:\n\n• Daños o perjuicios derivados del uso indebido del sitio web.\n• Interrupciones del servicio por causas de fuerza mayor o mantenimiento técnico.\n• Contenido de enlaces externos a terceros.\n• La exactitud de las opiniones y valoraciones de usuarios, que son responsabilidad exclusiva de quienes las emiten.\n\nLa responsabilidad del Responsable se limita al importe del pedido realizado.'
      },
      {
        title: '7. Propiedad Intelectual',
        text: 'Todos los contenidos del sitio web (textos, imágenes, logotipos, diseño, código fuente) son propiedad del Responsable o cuentan con la licencia correspondiente. Queda prohibida la reproducción total o parcial sin autorización expresa. Los nombres de platos, recetas y la marca PetriGastro son propiedad exclusiva del Responsable.'
      },
      {
        title: '8. Opiniones y Valoraciones',
        text: 'Los usuarios pueden dejar opiniones y valoraciones sobre los productos adquiridos. Al hacerlo, el usuario concede al Responsable una licencia no exclusiva, gratuita y perpetua para publicar dichas opiniones en el sitio web.\n\nEl Responsable se reserva el derecho de moderar y eliminar aquellas opiniones que contengan lenguaje ofensivo, spam, información falsa o que infrinjan derechos de terceros.'
      },
      {
        title: '9. Modificaciones',
        text: 'El Responsable se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios entrarán en vigor desde su publicación en el sitio web. Se recomienda al usuario revisar periódicamente esta página. El uso continuado del sitio web tras las modificaciones implica la aceptación de las mismas.'
      },
      {
        title: '10. Legislación Aplicable y Jurisdicción',
        text: 'Estas condiciones se rigen por la legislación española. Para cualquier controversia que pudiera derivarse del uso del sitio web o de los servicios ofrecidos, las partes se someten a la jurisdicción de los juzgados y tribunales de Madrid capital, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.'
      }
    ]
  }
}

type SectionKey = keyof typeof sections

export default function Legal() {
  const location = useLocation()
  const [activeSection, setActiveSection] = useState<SectionKey>(
    location.pathname === '/terminos' ? 'condiciones' : 'privacidad'
  )

  useEffect(() => {
    if (location.pathname === '/terminos') setActiveSection('condiciones')
    if (location.pathname === '/privacidad') setActiveSection('privacidad')
  }, [location.pathname])
  const section = sections[activeSection]

  return (
    <>
      <Helmet>
        <title>{section.title} | PetriGastro</title>
        <meta name="description" content={`${section.title} de PetriGastro. Cumplimiento normativo RGPD y LOPDGDD 2026.`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-6 sm:mb-8">{section.title}</h1>

        <div className="flex gap-2 mb-8 overflow-x-auto" role="tablist">
          <button
            role="tab"
            aria-selected={activeSection === 'privacidad'}
            onClick={() => setActiveSection('privacidad')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition ${
              activeSection === 'privacidad' ? 'bg-accent text-carbon' : 'bg-bg-secondary'
            }`}
          >
            Política de Privacidad
          </button>
          <button
            role="tab"
            aria-selected={activeSection === 'condiciones'}
            onClick={() => setActiveSection('condiciones')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition ${
              activeSection === 'condiciones' ? 'bg-accent text-carbon' : 'bg-bg-secondary'
            }`}
          >
            Términos y Condiciones
          </button>
        </div>

        <div className="space-y-8">
          {section.content.map((block, i) => (
            <div key={i}>
              <h2 className="text-xl font-bold mb-3">{block.title}</h2>
              {block.text.split('\n').map((line, j) => (
                line.startsWith('• ') ? (
                  <li key={j} className="text-text-muted leading-relaxed ml-4 mb-1 list-disc">{line}</li>
                ) : line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.') ? (
                  <p key={j} className="text-text-muted leading-relaxed mb-2 font-medium">{line}</p>
                ) : (
                  <p key={j} className="text-text-muted leading-relaxed mb-2">{line}</p>
                )
              ))}
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-bg-secondary rounded-lg text-sm text-text-muted">
          <p>Última actualización: 1 de enero de 2026</p>
          <p className="mt-2">
            Si tienes alguna pregunta sobre estas políticas, puedes contactarnos en{' '}
            <a href="mailto:hola@petrigastro.es" className="text-accent hover:underline">hola@petrigastro.es</a>
          </p>
        </div>
      </div>
    </>
  )
}
