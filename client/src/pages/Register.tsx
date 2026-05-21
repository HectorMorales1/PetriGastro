import { Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function Register() {
  return (
    <>
      <Helmet>
        <title>Registro | PetriGastro</title>
      </Helmet>
      <Navigate to="/login" state={{ registerMode: true }} replace />
    </>
  )
}