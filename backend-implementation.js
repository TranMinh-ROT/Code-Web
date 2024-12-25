// Required dependencies
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(bodyParser.json());

// Kết nối tới cơ sở dữ liệu
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '2725',
  database: 'bunbohue'
});

db.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối cơ sở dữ liệu:', err);
    return;
  }
  console.log('Đã kết nối tới cơ sở dữ liệu MySQL');
});

// GET endpoint - Get all orders for a customer
app.get('/api/orders/:customerId', (req, res) => {
  const customerId = req.params.customerId;
  const query = `
    SELECT o.*, oi.* 
    FROM orders o 
    JOIN order_items oi ON o.id = oi.order_id 
    WHERE o.customer_id = ? AND o.status = 'pending'
  `;
  
  db.query(query, [customerId], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json(results);
  });
});

// POST endpoint - Create new customer and initial order
app.post('/api/customers', (req, res) => {
  const { name } = req.body;
  
  db.query('INSERT INTO customers (name) VALUES (?)', [name], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error creating customer' });
      return;
    }
    
    res.json({ 
      id: result.insertId,
      name: name,
      message: 'Customer created successfully' 
    });
  });
});

// POST endpoint - Create new order
app.post('/api/orders', (req, res) => {
  const { customerId, items, totalAmount } = req.body;
  
  db.beginTransaction((err) => {
    if (err) {
      res.status(500).json({ error: 'Transaction error' });
      return;
    }

    // Create order
    db.query(
      'INSERT INTO orders (customer_id, total_amount) VALUES (?, ?)',
      [customerId, totalAmount],
      (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: 'Error creating order' });
          });
        }

        const orderId = result.insertId;

        // Insert order items
        const itemValues = items.map(item => [
          orderId,
          item.name,
          item.quantity,
          item.price,
          item.note,
          item.type
        ]);

        db.query(
          'INSERT INTO order_items (order_id, item_name, quantity, price, note, type) VALUES ?',
          [itemValues],
          (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ error: 'Error creating order items' });
              });
            }

            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ error: 'Error committing transaction' });
                });
              }
              res.json({ 
                orderId: orderId,
                message: 'Order created successfully' 
              });
            });
          }
        );
      }
    );
  });
});

// PUT endpoint - Update order
app.put('/api/orders/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  const { items, totalAmount } = req.body;
  
  db.beginTransaction((err) => {
    if (err) {
      res.status(500).json({ error: 'Transaction error' });
      return;
    }

    // Update order total
    db.query(
      'UPDATE orders SET total_amount = ? WHERE id = ?',
      [totalAmount, orderId],
      (err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: 'Error updating order' });
          });
        }

        // Delete existing order items
        db.query(
          'DELETE FROM order_items WHERE order_id = ?',
          [orderId],
          (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ error: 'Error updating order items' });
              });
            }

            // Insert new order items
            const itemValues = items.map(item => [
              orderId,
              item.name,
              item.quantity,
              item.price,
              item.note,
              item.type
            ]);

            db.query(
              'INSERT INTO order_items (order_id, item_name, quantity, price, note, type) VALUES ?',
              [itemValues],
              (err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ error: 'Error inserting new order items' });
                  });
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({ error: 'Error committing transaction' });
                    });
                  }
                  res.json({ message: 'Order updated successfully' });
                });
              }
            );
          }
        );
      }
    );
  });
});

// DELETE endpoint - Complete order (soft delete)
app.delete('/api/orders/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  
  db.query(
    'UPDATE orders SET status = "completed" WHERE id = ?',
    [orderId],
    (err) => {
      if (err) {
        res.status(500).json({ error: 'Error completing order' });
        return;
      }
      res.json({ message: 'Order completed successfully' });
    }
  );
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
