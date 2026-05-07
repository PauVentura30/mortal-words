from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
import hashlib

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///mortalwords.db"
db = SQLAlchemy(app)


class Jugador(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    vidas = db.Column(db.Integer, default=5)
    racha = db.Column(db.Integer, default=0)
    mejor_racha = db.Column(db.Integer, default=0)
    dias_sobrevividos = db.Column(db.Integer, default=0)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)


class Partida(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jugador_id = db.Column(db.Integer, db.ForeignKey("jugador.id"), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    palabra = db.Column(db.String(10), nullable=False)
    intentos = db.Column(db.Integer, default=0)
    acertada = db.Column(db.Boolean, default=False)


with app.app_context():
    db.create_all()


PALABRAS = [
    "PIANO", "FUEGO", "PLAYA", "TIGRE", "NOCHE",
    "CAMPO", "REINA", "LUNAR", "BRISA", "CLAVE",
    "DULCE", "FRESA", "GLOBO", "HUEVO", "JUGAR",
    "LIBRO", "MANGO", "NUBES", "OLIVE", "PERRO",
    "QUESO", "RUMBA", "SALSA", "TRIGO", "UNICO",
    "VERDE", "WALTZ", "EXTRA", "YERBA", "ZURDO"
]


def obtener_palabra_del_dia():
    hoy = date.today().isoformat()
    indice = int(hashlib.md5(hoy.encode()).hexdigest(), 16) % len(PALABRAS)
    return PALABRAS[indice]


@app.route("/")
def home():
    return {"status": "MORTAL WORDS API", "endpoints": ["/api/hello", "/api/register", "/api/login", "/api/guess"]}


@app.route("/api/hello")
def hello():
    return {"message": "MORTAL WORDS backend is alive"}


@app.route("/api/register", methods=["POST"])
def register():
    datos = request.get_json()

    if not datos or not datos.get("nombre") or not datos.get("password"):
        return jsonify({"error": "Nombre y password son obligatorios"}), 400

    nombre = datos["nombre"]
    password = datos["password"]

    existe = Jugador.query.filter_by(nombre=nombre).first()
    if existe:
        return jsonify({"error": "Ese nombre ya existe"}), 409

    nuevo = Jugador(nombre=nombre, password=password)
    db.session.add(nuevo)
    db.session.commit()

    return jsonify({"message": "Jugador creado", "id": nuevo.id, "nombre": nuevo.nombre}), 201


@app.route("/api/login", methods=["POST"])
def login():
    datos = request.get_json()

    if not datos or not datos.get("nombre") or not datos.get("password"):
        return jsonify({"error": "Nombre y password son obligatorios"}), 400

    jugador = Jugador.query.filter_by(nombre=datos["nombre"]).first()

    if not jugador or jugador.password != datos["password"]:
        return jsonify({"error": "Nombre o password incorrectos"}), 401

    return jsonify({
        "id": jugador.id,
        "nombre": jugador.nombre,
        "vidas": jugador.vidas,
        "racha": jugador.racha,
        "mejor_racha": jugador.mejor_racha,
        "dias_sobrevividos": jugador.dias_sobrevividos
    })


@app.route("/api/guess", methods=["POST"])
def guess():
    datos = request.get_json()

    if not datos or not datos.get("jugador_id") or not datos.get("intento"):
        return jsonify({"error": "jugador_id e intento son obligatorios"}), 400

    jugador = Jugador.query.get(datos["jugador_id"])
    if not jugador:
        return jsonify({"error": "Jugador no encontrado"}), 404

    if jugador.vidas <= 0:
        return jsonify({"error": "No te quedan vidas. Game Over."}), 403

    palabra_del_dia = obtener_palabra_del_dia()
    intento = datos["intento"].upper()

    if len(intento) != 5:
        return jsonify({"error": "La palabra debe tener 5 letras"}), 400

    hoy = date.today()
    partida = Partida.query.filter_by(jugador_id=jugador.id, fecha=hoy).first()

    if partida and partida.acertada:
        return jsonify({"error": "Ya has acertado la palabra de hoy"}), 400

    if not partida:
        partida = Partida(jugador_id=jugador.id, fecha=hoy, palabra=palabra_del_dia)
        db.session.add(partida)

    partida.intentos += 1

    resultado = []
    for i in range(5):
        if intento[i] == palabra_del_dia[i]:
            resultado.append({"letra": intento[i], "estado": "correcto"})
        elif intento[i] in palabra_del_dia:
            resultado.append({"letra": intento[i], "estado": "presente"})
        else:
            resultado.append({"letra": intento[i], "estado": "ausente"})

    acertada = intento == palabra_del_dia

    if acertada:
        partida.acertada = True
        jugador.racha += 1
        jugador.dias_sobrevividos += 1
        if jugador.racha > jugador.mejor_racha:
            jugador.mejor_racha = jugador.racha

    if partida.intentos >= 4 and not acertada:
        jugador.vidas -= 1
        jugador.racha = 0
        if jugador.vidas <= 0:
            jugador.racha = 0

    db.session.commit()

    return jsonify({
        "resultado": resultado,
        "acertada": acertada,
        "intentos_usados": partida.intentos,
        "vidas": jugador.vidas,
        "racha": jugador.racha,
        "mejor_racha": jugador.mejor_racha,
        "dias_sobrevividos": jugador.dias_sobrevividos
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)