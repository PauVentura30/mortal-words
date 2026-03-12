import { useState } from "react"

function obtenerColor(letra, posicion, palabraSecreta) {
  if (letra === palabraSecreta[posicion]) {
    return "#538d4e"
  }
  if (palabraSecreta.includes(letra)) {
    return "#b59f3b"
  }
  return "#3a3a3c"
}

function obtenerEstadoTeclado(intentos, palabraSecreta) {
  const estado = {}

  intentos.forEach((intento) => {
    if (intento === "") {
      return
    }
    for (let i = 0; i < intento.length; i++) {
      const letra = intento[i]

      if (letra === palabraSecreta[i]) {
        estado[letra] = "#538d4e"
      } else if (palabraSecreta.includes(letra)) {
        if (estado[letra] !== "#538d4e") {
          estado[letra] = "#b59f3b"
        }
      } else {
        if (!estado[letra]) {
          estado[letra] = "#3a3a3c"
        }
      }
    }
  })

  return estado
}

function App() {
  const titulo = "MORTAL WORDS"
  const longitudPalabra = 5
  const palabraSecreta = "PIANO"
  const [intentos, setIntentos] = useState(["", "", "", ""])
  const [intentoActual, setIntentoActual] = useState("")

  const tecladoFilas = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["Z","X","C","V","B","N","M"]
  ]

  const filaActual = intentos.findIndex((intento) => {
    return intento === ""
  })

  const haGanado = intentos.includes(palabraSecreta)
  const haPerdido = !haGanado && filaActual === -1
  const estadoTeclado = obtenerEstadoTeclado(intentos, palabraSecreta)

  function enviarIntento() {
    if (intentoActual.length !== longitudPalabra) {
      return
    }
    if (filaActual === -1) {
      return
    }
    const nuevosIntentos = [...intentos]
    nuevosIntentos[filaActual] = intentoActual
    setIntentos(nuevosIntentos)
    setIntentoActual("")
  }

  function pulsarTecla(letra) {
    if (haGanado || haPerdido) {
      return
    }
    if (intentoActual.length >= longitudPalabra) {
      return
    }
    setIntentoActual(intentoActual + letra)
  }

  function borrarLetra() {
    setIntentoActual(intentoActual.slice(0, -1))
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "100vh"
    }}>
      <h1>{titulo}</h1>
      <div>
        {intentos.map((intento, filaPosicion) => {
          return (
            <div key={filaPosicion} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              {Array(longitudPalabra).fill("").map((casilla, casillaPosicion) => {
                const esFilaActual = filaPosicion === filaActual
                const letra = esFilaActual
                  ? intentoActual[casillaPosicion] || ""
                  : intento[casillaPosicion] || ""
                const tieneLetra = letra !== ""
                const estaEnviado = intento !== ""
                const colorFondo = estaEnviado && tieneLetra
                  ? obtenerColor(letra, casillaPosicion, palabraSecreta)
                  : "transparent"

                return (
                  <div
                    key={casillaPosicion}
                    style={{
                      width: "50px",
                      height: "50px",
                      border: estaEnviado && tieneLetra ? "none" : esFilaActual && tieneLetra ? "2px solid white" : "2px solid gray",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "white",
                      backgroundColor: colorFondo
                    }}
                  >
                    {letra}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {haGanado && <p>¡Has ganado! 🎉</p>}
      {haPerdido && <p>La palabra era {palabraSecreta} 💀</p>}

      <div style={{ marginTop: "16px" }}>
        {tecladoFilas.map((fila, filaIndex) => {
          return (
            <div key={filaIndex} style={{ display: "flex", gap: "4px", justifyContent: "center", marginBottom: "4px" }}>
              {filaIndex === 2 && (
                <button
                  onClick={borrarLetra}
                  style={{
                    padding: "10px 12px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    backgroundColor: "#818384",
                    color: "white"
                  }}
                >
                  ←
                </button>
              )}
              {fila.map((letra) => {
                return (
                  <button
                    key={letra}
                    onClick={() => {
                      pulsarTecla(letra)
                    }}
                    style={{
                      padding: "10px 12px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      backgroundColor: estadoTeclado[letra] || "#818384",
                      color: "white"
                    }}
                  >
                    {letra}
                  </button>
                )
              })}
              {filaIndex === 2 && (
                <button
                  onClick={enviarIntento}
                  style={{
                    padding: "10px 12px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    backgroundColor: "#818384",
                    color: "white"
                  }}
                >
                  ENTER
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App