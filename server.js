const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'tu-secreto-super-seguro-cambiar-en-produccion';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Base de datos SQLite
const db = new sqlite3.Database('./crm_artesano.db', (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos SQLite');
    initDatabase();
  }
});

// Inicializar tablas
function initDatabase() {
  // Tabla de usuarios (clientes y admin)
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    direccion TEXT,
    password TEXT NOT NULL,
    rol TEXT DEFAULT 'cliente',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de productos
  db.run(`CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL NOT NULL,
    unidad TEXT DEFAULT 'unidad',
    disponible INTEGER DEFAULT 1,
    imagen_url TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de pedidos
  db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    direccion_entrega TEXT NOT NULL,
    fecha_deseada DATE,
    notas TEXT,
    estado TEXT DEFAULT 'pendiente',
    total REAL DEFAULT 0,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  )`);

  // Tabla de items del pedido
  db.run(`CREATE TABLE IF NOT EXISTS pedido_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
  )`);

  // Crear usuario admin por defecto
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO usuarios (id, nombre, email, password, rol) 
          VALUES (1, 'Administrador', 'admin@artesano.com', ?, 'admin')`, 
          [adminPassword]);

  // Crear algunos productos de ejemplo
  db.run(`INSERT OR IGNORE INTO productos (id, nombre, descripcion, precio, unidad) 
          VALUES 
          (1, 'Pan Artesanal', 'Pan de masa madre tradicional', 8000, 'unidad'),
          (2, 'Galletas de Mantequilla', 'Paquete de 12 galletas caseras', 12000, 'paquete'),
          (3, 'Mermelada de Mora', 'Frasco de 250g', 15000, 'frasco'),
          (4, 'Torta de Chocolate', 'Porción individual', 10000, 'porción')`);
}

// Middleware de autenticación
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

// Middleware para verificar rol admin
function isAdmin(req, res, next) {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
  }
  next();
}

// ===== RUTAS DE AUTENTICACIÓN =====

// Registro de cliente
app.post('/api/registro', async (req, res) => {
  const { nombre, email, telefono, direccion, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      `INSERT INTO usuarios (nombre, email, telefono, direccion, password, rol) 
       VALUES (?, ?, ?, ?, ?, 'cliente')`,
      [nombre, email, telefono, direccion, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'El email ya está registrado' });
          }
          return res.status(500).json({ error: 'Error al registrar usuario' });
        }
        
        const token = jwt.sign({ id: this.lastID, email, rol: 'cliente' }, JWT_SECRET);
        res.json({ 
          message: 'Usuario registrado exitosamente', 
          token,
          usuario: { id: this.lastID, nombre, email, rol: 'cliente' }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, usuario) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol }, 
      JWT_SECRET
    );
    
    res.json({ 
      token,
      usuario: { 
        id: usuario.id, 
        nombre: usuario.nombre, 
        email: usuario.email, 
        rol: usuario.rol 
      }
    });
  });
});

// ===== RUTAS DE PRODUCTOS =====

// Obtener todos los productos
app.get('/api/productos', (req, res) => {
  db.all('SELECT * FROM productos WHERE disponible = 1', [], (err, productos) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener productos' });
    }
    res.json(productos);
  });
});

// Crear producto (solo admin)
app.post('/api/productos', authenticateToken, isAdmin, (req, res) => {
  const { nombre, descripcion, precio, unidad, imagen_url } = req.body;

  db.run(
    `INSERT INTO productos (nombre, descripcion, precio, unidad, imagen_url) 
     VALUES (?, ?, ?, ?, ?)`,
    [nombre, descripcion, precio, unidad, imagen_url],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al crear producto' });
      }
      res.json({ message: 'Producto creado', id: this.lastID });
    }
  );
});

// Actualizar producto (solo admin)
app.put('/api/productos/:id', authenticateToken, isAdmin, (req, res) => {
  const { nombre, descripcion, precio, unidad, disponible, imagen_url } = req.body;
  const { id } = req.params;

  db.run(
    `UPDATE productos 
     SET nombre = ?, descripcion = ?, precio = ?, unidad = ?, disponible = ?, imagen_url = ?
     WHERE id = ?`,
    [nombre, descripcion, precio, unidad, disponible, imagen_url, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar producto' });
      }
      res.json({ message: 'Producto actualizado' });
    }
  );
});

// Eliminar producto (solo admin)
app.delete('/api/productos/:id', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  
  db.run('UPDATE productos SET disponible = 0 WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar producto' });
    }
    res.json({ message: 'Producto eliminado' });
  });
});

// ===== RUTAS DE PEDIDOS =====

// Crear pedido
app.post('/api/pedidos', authenticateToken, (req, res) => {
  const { items, direccion_entrega, fecha_deseada, notas } = req.body;
  const usuario_id = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Debe incluir al menos un producto' });
  }

  // Calcular total
  let total = 0;
  items.forEach(item => {
    total += item.cantidad * item.precio_unitario;
  });

  // Iniciar transacción
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Insertar pedido
    db.run(
      `INSERT INTO pedidos (usuario_id, direccion_entrega, fecha_deseada, notas, total) 
       VALUES (?, ?, ?, ?, ?)`,
      [usuario_id, direccion_entrega, fecha_deseada, notas, total],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Error al crear pedido' });
        }

        const pedido_id = this.lastID;

        // Insertar items del pedido
        const stmt = db.prepare(`
          INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal) 
          VALUES (?, ?, ?, ?, ?)
        `);

        items.forEach(item => {
          const subtotal = item.cantidad * item.precio_unitario;
          stmt.run([pedido_id, item.producto_id, item.cantidad, item.precio_unitario, subtotal]);
        });

        stmt.finalize(err => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Error al guardar items del pedido' });
          }

          db.run('COMMIT');
          res.json({ 
            message: 'Pedido creado exitosamente', 
            pedido_id,
            total 
          });
        });
      }
    );
  });
});

// Obtener pedidos del usuario actual
app.get('/api/mis-pedidos', authenticateToken, (req, res) => {
  const usuario_id = req.user.id;

  db.all(
    `SELECT p.*, u.nombre as cliente_nombre, u.telefono as cliente_telefono
     FROM pedidos p
     JOIN usuarios u ON p.usuario_id = u.id
     WHERE p.usuario_id = ?
     ORDER BY p.fecha_pedido DESC`,
    [usuario_id],
    (err, pedidos) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener pedidos' });
      }
      res.json(pedidos);
    }
  );
});

// Obtener todos los pedidos (solo admin)
app.get('/api/pedidos', authenticateToken, isAdmin, (req, res) => {
  db.all(
    `SELECT p.*, u.nombre as cliente_nombre, u.email as cliente_email, u.telefono as cliente_telefono
     FROM pedidos p
     JOIN usuarios u ON p.usuario_id = u.id
     ORDER BY p.fecha_pedido DESC`,
    [],
    (err, pedidos) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener pedidos' });
      }
      res.json(pedidos);
    }
  );
});

// Obtener detalles de un pedido
app.get('/api/pedidos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const usuario_id = req.user.id;
  const rol = req.user.rol;

  // Query para obtener el pedido con información del cliente
  const pedidoQuery = `
    SELECT p.*, u.nombre as cliente_nombre, u.email as cliente_email, u.telefono as cliente_telefono
    FROM pedidos p
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.id = ?
    ${rol === 'cliente' ? 'AND p.usuario_id = ?' : ''}
  `;

  const params = rol === 'cliente' ? [id, usuario_id] : [id];

  db.get(pedidoQuery, params, (err, pedido) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener pedido' });
    }
    
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Obtener items del pedido
    db.all(
      `SELECT pi.*, pr.nombre as producto_nombre, pr.unidad
       FROM pedido_items pi
       JOIN productos pr ON pi.producto_id = pr.id
       WHERE pi.pedido_id = ?`,
      [id],
      (err, items) => {
        if (err) {
          return res.status(500).json({ error: 'Error al obtener items del pedido' });
        }
        
        res.json({ ...pedido, items });
      }
    );
  });
});

// Actualizar estado del pedido (solo admin)
app.put('/api/pedidos/:id/estado', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  db.run(
    'UPDATE pedidos SET estado = ? WHERE id = ?',
    [estado, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar estado' });
      }
      res.json({ message: 'Estado actualizado' });
    }
  );
});

// ===== RUTAS DE ESTADÍSTICAS (solo admin) =====

app.get('/api/estadisticas', authenticateToken, isAdmin, (req, res) => {
  db.all(`
    SELECT 
      (SELECT COUNT(*) FROM pedidos) as total_pedidos,
      (SELECT COUNT(*) FROM pedidos WHERE estado = 'pendiente') as pedidos_pendientes,
      (SELECT COUNT(*) FROM pedidos WHERE estado = 'completado') as pedidos_completados,
      (SELECT COUNT(*) FROM usuarios WHERE rol = 'cliente') as total_clientes,
      (SELECT SUM(total) FROM pedidos) as ventas_totales,
      (SELECT SUM(total) FROM pedidos WHERE estado = 'completado') as ventas_completadas
  `, [], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
    res.json(stats[0]);
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log('Credenciales de admin por defecto:');
  console.log('Email: admin@artesano.com');
  console.log('Password: admin123');
});
