# Sistema de Gestión de Red Eléctrica
*Simulador de Carga Residencial*

Esta plataforma representa una arquitectura de software distribuida y altamente escalable diseñada para la simulación, gestión y validación de carga en redes eléctricas residenciales. El sistema integra componentes modernos de orquestación, balanceo de carga y persistencia para asegurar la integridad de los datos de consumo energético bajo condiciones de alta concurrencia.

<img width="1727" height="1014" alt="Captura de pantalla 2026-05-25 200326" src="https://github.com/user-attachments/assets/f12c303c-50dd-464a-95a0-19aed19b81d9" />

## Arquitectura del Sistema
El sistema se basa en una arquitectura de cuatro niveles desacoplados, implementados mediante **Docker y Docker Compose** para garantizar portabilidad, consistencia en el despliegue y alta disponibilidad:

1.  **Nivel de Entrada (Proxy Inverso):** Implementado con `nginx:alpine`, optimizado para gestionar el tráfico entrante y balancear la carga entre las réplicas del motor lógico.
2.  **Nivel de Presentación (Frontend):** Interfaz web interactiva (HTML/JS) para la visualización de datos de consumo y estado del sistema.
3.  **Nivel de Lógica (Backend):** Réplicas dinámicas en Node.js, encargadas del procesamiento de consultas de carga y stock energético.
4.  **Nivel de Datos (Base de Datos):** Servidor MySQL configurado con persistencia de volúmenes, garantizando que el estado de la red eléctrica se mantenga tras reinicios del sistema.
## Topología y Composición de Docker (Orquestación)
El clúster está gestionado por un único archivo `docker-compose.yaml` que define una topología estricta de servicios, redes aisladas y almacenamiento:

### 1. Servicios y Replicación
* **`proxy` (Nginx):** Único servicio que expone puertos al exterior (`80:80`). Actúa como barrera y director de orquesta.
* **`frontend` (Web):** Contenedor de presentación construido desde su propio Dockerfile.
* **`backend` (Node.js API):** Configurado con la directiva `deploy: replicas: 2` para levantar automáticamente dos instancias paralelas que reciben el tráfico balanceado del proxy.
* **`database` (PostgreSQL):** Motor de base de datos protegido; **no expone puertos al host** por políticas de seguridad institucionales.

### 2. Segmentación de Redes (Aislamiento)
Para garantizar la seguridad, el sistema utiliza dos redes tipo `bridge`:
* **`network_public`:** Conecta al Proxy, Frontend y Backend. Permite que Nginx reciba tráfico externo y lo rutee hacia las aplicaciones.
* **`network_private`:** Red exclusiva y aislada donde solo el Backend y la Base de Datos pueden comunicarse. Impide cualquier intento de conexión directa a los datos desde el exterior.

### 3. Almacenamiento (Volúmenes)
* **`db_data`:** Volumen con nombre (named volume) manejado por el driver local, mapeado al directorio `/var/lib/postgresql/data` del contenedor de la base de datos. Garantiza que la información del sistema no se pierda si los contenedores son apagados o destruidos.

## Componentes Clave
* **Balanceo de Carga:** Configurado con el algoritmo `least_conn` en Nginx, permitiendo dirigir el tráfico al nodo con menor carga activa para maximizar la capacidad de respuesta.
* **Persistencia Robusta:** Los datos de consumo se gestionan a través de una estructura relacional validada con `DECIMAL(3,1)`, lo que asegura la precisión necesaria para lecturas de potencia eléctrica.
* **Escalabilidad Dinámica:** La infraestructura permite el despliegue de réplicas adicionales bajo demanda mediante comandos de orquestación, adaptándose al incremento de usuarios simultáneos en la red.
* **Automatización de Despliegue:** El sistema cuenta con procesos de inicialización automática de esquemas de datos, facilitando la puesta en marcha mediante un entorno de contenedores unificado.

## Guía de Despliegue
Para desplegar la solución en cualquier entorno compatible con Docker:

1.  Clonar el repositorio y acceder a la carpeta del proyecto:
    ```bash
    git clone https://github.com/sm0k3rG/Taller3.git
    cd Taller3
    ```
2.  Desplegar la infraestructura completa:
    ```bash
    docker-compose up -d --build
    ```
3.  Validar el estado del sistema:
    ```bash
    docker-compose ps
    ```
