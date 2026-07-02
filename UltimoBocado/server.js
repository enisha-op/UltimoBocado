const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const db = new sqlite3.Database("./bd/UltimoBocado.bd", (err) => {
    if (err) {
        console.log("Error al conectar con la base de datos:", err.message);
    } else {
        console.log("Base de datos SQLite conectada correctamente");
    }
});

db.run("PRAGMA foreign_keys = ON");

function ejecutar(sql, parametros = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, parametros, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
}

function consultarUno(sql, parametros = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, parametros, function(err, fila) {
            if (err) {
                reject(err);
            } else {
                resolve(fila);
            }
        });
    });
}

function consultarVarios(sql, parametros = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, parametros, function(err, filas) {
            if (err) {
                reject(err);
            } else {
                resolve(filas);
            }
        });
    });
}

/* REGISTRAR USUARIO */
app.post("/api/registrar", async (req, res) => {
    try {
        const { nombre, correo, contrasena } = req.body;

        const sql = `
            INSERT INTO usuarios (nombre, correo, contrasena, fecha_registro)
            VALUES (?, ?, ?, date('now'))
        `;

        const resultado = await ejecutar(sql, [nombre, correo, contrasena]);

        res.json({
            ok: true,
            mensaje: "Usuario registrado correctamente",
            id_usuario: resultado.lastID
        });
    } catch (error) {
        console.log("Error al registrar usuario:", error.message);

        res.status(400).json({
            ok: false,
            mensaje: "El correo ya existe o los datos no son válidos"
        });
    }
});

/* INICIAR SESIÓN */
app.post("/api/login", async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        const sql = `
            SELECT id_usuario, nombre, correo
            FROM usuarios
            WHERE correo = ? AND contrasena = ?
        `;

        const usuario = await consultarUno(sql, [correo, contrasena]);

        if (!usuario) {
            return res.status(401).json({
                ok: false,
                mensaje: "Correo o contraseña incorrectos"
            });
        }

        res.json({
            ok: true,
            mensaje: "Inicio de sesión correcto",
            usuario: usuario
        });
    } catch (error) {
        console.log("Error al iniciar sesión:", error.message);

        res.status(500).json({
            ok: false,
            mensaje: "Error al consultar el usuario"
        });
    }
});

/* LISTAR COMIDAS */
app.get("/api/comidas", async (req, res) => {
    try {
        const sql = `
            SELECT
                id_comida,
                nombre,
                local_aliado,
                descripcion,
                precio_original,
                precio_oferta,
                estado,
                urgencia,
                CASE
                    WHEN nombre = 'Ensalada de pollo' THEN 'images/ensalada.png'
                    WHEN nombre = 'Pack de panes dulces' THEN 'images/panes.png'
                    WHEN nombre = 'Arroz chaufa vegetariano' THEN 'images/chaufa.png'
                    WHEN nombre = 'Combo sopa y guiso' THEN 'images/sopa.png'
                    ELSE 'images/menu_ilustracion.png'
                END AS imagen
            FROM comidas
            WHERE estado = 'Disponible'
        `;

        const comidas = await consultarVarios(sql);

        res.json({
            ok: true,
            comidas: comidas
        });
    } catch (error) {
        console.log("Error al listar comidas:", error.message);

        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener comidas"
        });
    }
});

/* LISTAR OFERTAS */
app.get("/api/ofertas", async (req, res) => {
    try {
        const sql = `
            SELECT
                id_comida,
                nombre,
                local_aliado,
                descripcion,
                precio_original,
                precio_oferta,
                estado,
                urgencia,
                CASE
                    WHEN nombre = 'Ensalada de pollo' THEN 'images/ensalada.png'
                    WHEN nombre = 'Pack de panes dulces' THEN 'images/panes.png'
                    WHEN nombre = 'Arroz chaufa vegetariano' THEN 'images/chaufa.png'
                    WHEN nombre = 'Combo sopa y guiso' THEN 'images/sopa.png'
                    ELSE 'images/ofertas_ilustracion.png'
                END AS imagen,
                CASE
                    WHEN nombre = 'Pack de panes dulces' THEN 'Últimas 3 unidades'
                    WHEN nombre = 'Ensalada de pollo' THEN 'Recojo antes de 7:00 p. m.'
                    WHEN nombre = 'Combo sopa y guiso' THEN 'Solo por hoy'
                    ELSE 'Oferta disponible'
                END AS etiqueta
            FROM comidas
            WHERE estado = 'Disponible'
            ORDER BY urgencia ASC
        `;

        const ofertas = await consultarVarios(sql);

        res.json({
            ok: true,
            ofertas: ofertas
        });
    } catch (error) {
        console.log("Error al listar ofertas:", error.message);

        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener ofertas"
        });
    }
});

/* REGISTRAR PEDIDO */
app.post("/api/pedidos", async (req, res) => {
    try {
        const { cliente, telefono, notas, platos, cantidad } = req.body;

        if (!cliente || !telefono || !platos || platos.length === 0) {
            return res.status(400).json({
                ok: false,
                mensaje: "Faltan datos para registrar el pedido"
            });
        }

        let total = 0;
        const comidasEncontradas = [];

        for (const nombrePlato of platos) {
            const sqlComida = `
                SELECT id_comida, nombre, precio_oferta
                FROM comidas
                WHERE nombre = ?
            `;

            const comida = await consultarUno(sqlComida, [nombrePlato]);

            if (comida) {
                const subtotal = comida.precio_oferta * cantidad;
                total = total + subtotal;

                comidasEncontradas.push({
                    id_comida: comida.id_comida,
                    nombre: comida.nombre,
                    subtotal: subtotal
                });
            }
        }

        if (comidasEncontradas.length === 0) {
            return res.status(400).json({
                ok: false,
                mensaje: "No se encontraron los platos seleccionados"
            });
        }

        const sqlPedido = `
            INSERT INTO pedidos (id_usuario, cliente, telefono, fecha_pedido, estado, total, notas)
            VALUES (NULL, ?, ?, date('now'), 'En proceso', ?, ?)
        `;

        const pedido = await ejecutar(sqlPedido, [cliente, telefono, total, notas]);
        const idPedido = pedido.lastID;

        for (const comida of comidasEncontradas) {
            const sqlDetalle = `
                INSERT INTO detalle_pedido (id_pedido, id_comida, cantidad, subtotal)
                VALUES (?, ?, ?, ?)
            `;

            await ejecutar(sqlDetalle, [
                idPedido,
                comida.id_comida,
                cantidad,
                comida.subtotal
            ]);
        }

        res.json({
            ok: true,
            mensaje: "Pedido registrado correctamente",
            id_pedido: idPedido,
            total: total.toFixed(2)
        });
    } catch (error) {
        console.log("Error al registrar pedido:", error.message);

        res.status(500).json({
            ok: false,
            mensaje: "No se pudo registrar el pedido"
        });
    }
});

/* LISTAR PEDIDOS */
app.get("/api/pedidos", async (req, res) => {
    try {
        const sql = `
            SELECT
                p.id_pedido,
                p.cliente,
                p.telefono,
                GROUP_CONCAT(c.nombre, ', ') AS platos,
                SUM(d.cantidad) AS cantidad,
                p.total,
                p.fecha_pedido AS fecha,
                p.estado
            FROM pedidos p
            LEFT JOIN detalle_pedido d ON p.id_pedido = d.id_pedido
            LEFT JOIN comidas c ON d.id_comida = c.id_comida
            GROUP BY p.id_pedido, p.cliente, p.telefono, p.total, p.fecha_pedido, p.estado
            ORDER BY p.id_pedido DESC
        `;

        const pedidos = await consultarVarios(sql);

        res.json({
            ok: true,
            pedidos: pedidos
        });
    } catch (error) {
        console.log("Error al listar pedidos:", error.message);

        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener pedidos"
        });
    }
});

/* LIMPIAR PEDIDOS */
app.delete("/api/pedidos", async (req, res) => {
    try {
        await ejecutar("DELETE FROM detalle_pedido");
        await ejecutar("DELETE FROM pedidos");

        res.json({
            ok: true,
            mensaje: "Historial de pedidos eliminado"
        });
    } catch (error) {
        console.log("Error al limpiar pedidos:", error.message);

        res.status(500).json({
            ok: false,
            mensaje: "No se pudo limpiar el historial"
        });
    }
});

app.listen(PORT, () => {
    console.log("Servidor iniciado en http://localhost:" + PORT);
});