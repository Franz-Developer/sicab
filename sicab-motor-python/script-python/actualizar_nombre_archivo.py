# C:\sistemas\sicab\sicab-motor-python\script-python\actualizar_nombre_archivo.py
import os
import glob

# =======================================================
# NOMBRE DE LA APP
# =======================================================
APP = "sicab"

# Carpeta raíz del proyecto
BASE = rf"C:\sistemas\{APP}"

# Carpetas a procesar
CARPETAS = [
    os.path.join(BASE, f"{APP}-backend"),
    os.path.join(BASE, f"{APP}-frontend"),
    os.path.join(BASE, f"{APP}-motor-python"),
]

def procesar_carpeta(base_dir, extension, comentario_inicio="//", comentario_fin=""):
    patron = os.path.join(base_dir, "**", extension)

    for ruta_archivo in glob.glob(patron, recursive=True):
        # Ignorar node_modules, dist, venv, __pycache__, .nuxt
        if ("node_modules" in ruta_archivo
                or "dist" in ruta_archivo
                or "venv" in ruta_archivo
                or "__pycache__" in ruta_archivo
                or ".nuxt" in ruta_archivo):
            continue

        ruta_absoluta = os.path.abspath(ruta_archivo)
        ruta_normalizada = f"{comentario_inicio} {ruta_absoluta}{comentario_fin}"

        try:
            with open(ruta_archivo, "r", encoding="utf-8") as f:
                lineas = f.readlines()

            if not lineas:
                nueva_data = f"{ruta_normalizada}\n"
            else:
                primera_linea = lineas[0].strip()
                if primera_linea.startswith(comentario_inicio):
                    lineas[0] = f"{ruta_normalizada}\n"
                    nueva_data = "".join(lineas)
                else:
                    nueva_data = f"{ruta_normalizada}\n" + "".join(lineas)

            with open(ruta_archivo, "w", encoding="utf-8") as f:
                f.write(nueva_data)

            print(f"Procesado: {ruta_archivo}")
        except Exception as e:
            print(f"Error en {ruta_archivo}: {e}")

def procesar_archivos():
    # Backend (.ts)
    print("=== BACKEND (.ts) ===")
    procesar_carpeta(CARPETAS[0], "*.ts", comentario_inicio="//")

    # Frontend (.ts)
    print("\n=== FRONTEND (.ts) ===")
    procesar_carpeta(CARPETAS[1], "*.ts", comentario_inicio="//")

    # Frontend (.vue)
    print("\n=== FRONTEND (.vue) ===")
    procesar_carpeta(CARPETAS[1], "*.vue", comentario_inicio="<!--", comentario_fin=" -->")

    # Motor Python (.py)
    print("\n=== MOTOR PYTHON (.py) ===")
    procesar_carpeta(CARPETAS[2], "*.py", comentario_inicio="#")

if __name__ == "__main__":
    procesar_archivos()
