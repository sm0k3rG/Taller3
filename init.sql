CREATE TABLE IF NOT EXISTS dispositivos (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    NAME VARCHAR(100) NOT NULL,
    CONSUMO_KW DECIMAL(3,1) NOT NULL
);

INSERT INTO dispositivos (NAME, CONSUMO_KW) VALUES 
('Refrigerador', 0.8),
('Microondas', 1.2),
('Lavadora', 2.0),
('Aire Acondicionado', 0.7),
('Computador de Escritorio', 2.7),
('Hervidor Electrico', 0.3);