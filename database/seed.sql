sql
USE logisticat_db;

INSERT INTO configuraciones (clave, valor)
VALUES ('meses_historial', '3')
ON DUPLICATE KEY UPDATE valor = valor;

INSERT INTO productos (nombre, cantidad, unidad, fecha_ingreso, fecha_caducidad) VALUES
('Leche Deslactosada', 23, 'L', '2026-06-08', '2026-06-10'),
('Queso tipo Philadelphia', 7, 'pieza', '2026-06-07', '2026-06-14'),
('Café Molido', 14, 'kg', '2026-06-01', '2026-09-10'),
('Polvo de chocolate para bebida', 4, 'kg', '2026-05-20', '2027-03-05');

INSERT INTO movimientos (id_producto, nombre_producto, tipo, cantidad, unidad, motivo) VALUES
(1, 'Leche Deslactosada', 'entrada', 23, 'L', 'Carga inicial de producto'),
(2, 'Queso tipo Philadelphia', 'entrada', 7, 'pieza', 'Carga inicial de producto'),
(3, 'Café Molido', 'entrada', 14, 'kg', 'Carga inicial de producto'),
(4, 'Polvo de chocolate para bebida', 'entrada', 4, 'kg', 'Carga inicial de producto');

