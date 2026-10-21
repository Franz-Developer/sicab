# C:\sistemas\sicab\sicab-motor-python\script-python\genera.py
import re
import os

# =======================================================
# NOMBRE DE LA APP
# =======================================================
APP = "sicab"

BASE = rf"C:\sistemas\{APP}"

# Rutas derivadas
ARCHIVO_CONSTANTES = os.path.join(
    BASE, f"{APP}-backend", "src", "common", "constants", "estados.constant.ts"
)
ARCHIVO_SALIDA = os.path.join(
    BASE, f"{APP}-backend", "db", "query", "salida.sql"
)

def leer_constantes():
    # ---------------------------------------------------
    # 1. Verificar que existe la carpeta BASE
    # ---------------------------------------------------
    if not os.path.isdir(BASE):
        print(f"[ERROR] No existe la carpeta base: {BASE}")
        print(f"        Verifica que el proyecto '{APP}' esté en C:\\sistemas\\")
        return

    # ---------------------------------------------------
    # 2. Verificar que existe el archivo de constantes
    # ---------------------------------------------------
    if not os.path.exists(ARCHIVO_CONSTANTES):
        print(f"[ERROR] No se encontró el archivo de constantes:")
        print(f"        {ARCHIVO_CONSTANTES}")
        print(f"        Verifica la ruta o el nombre del archivo.")
        return

    # ---------------------------------------------------
    # 3. Verificar que el archivo no esté vacío
    # ---------------------------------------------------
    try:
        with open(ARCHIVO_CONSTANTES, 'r', encoding='utf-8') as f:
            contenido = f.read()
    except Exception as e:
        print(f"[ERROR] No se pudo leer el archivo:")
        print(f"        {ARCHIVO_CONSTANTES}")
        print(f"        Detalle: {e}")
        return

    if not contenido.strip():
        print(f"[ERROR] El archivo de constantes está vacío:")
        print(f"        {ARCHIVO_CONSTANTES}")
        return

    # ---------------------------------------------------
    # 4. Verificar / crear el directorio de salida
    # ---------------------------------------------------
    try:
        os.makedirs(os.path.dirname(ARCHIVO_SALIDA), exist_ok=True)
    except OSError as e:
        print(f"[ERROR] No se pudo crear el directorio de salida:")
        print(f"        {os.path.dirname(ARCHIVO_SALIDA)}")
        print(f"        Detalle: {e}")
        return

    # ---------------------------------------------------
    # 5. Pedir números al usuario
    # ---------------------------------------------------
    entrada = input("Ingrese números de 4 cifras separados por espacio (1050-9999, terminados en 00 o 50): ")
    numeros = entrada.split()

    numeros_validos = []
    for num in numeros:
        try:
            valor = int(num)
            if 1050 <= valor <= 9999 and (valor % 100 == 0 or valor % 100 == 50):
                numeros_validos.append(valor)
            elif 1000 <= valor <= 9999:
                print(f"Advertencia: El número {valor} no termina en 00 o 50, no se tomará en cuenta.")
            else:
                print(f"Advertencia: El número {valor} no está en el rango 1050-9999, no se tomará en cuenta.")
        except ValueError:
            print(f"Advertencia: '{num}' no es un número válido, no se tomará en cuenta.")

    # Siempre incluir el bloque ESTADO (1000-1003)
    numeros_validos.append(1000)

    numeros_validos = sorted(set(numeros_validos))
    print(f"Números procesados (ordenados): {numeros_validos}")

    # ---------------------------------------------------
    # 6. Extraer encabezado
    # ---------------------------------------------------
    encabezado = extraer_encabezado(contenido)
    if encabezado is None:
        print("[ADVERTENCIA] No se encontró 'export interface ConstanteMetadata' en el archivo fuente.")

    # ---------------------------------------------------
    # 7. Extraer bloques
    # ---------------------------------------------------
    bloques_encontrados = []
    for numero in numeros_validos:
        bloque = extraer_bloque_completo(contenido, numero)
        if bloque:
            bloques_encontrados.append(bloque)
            print(f"Bloque encontrado para {numero}")
        else:
            print(f"No se encontró bloque para el número {numero}")

    # ---------------------------------------------------
    # 8. Si no hay nada que escribir, avisar y salir
    # ---------------------------------------------------
    if not encabezado and not bloques_encontrados:
        print("\n[ERROR] No hay contenido para escribir en el archivo de salida.")
        print("        No se creó ningún archivo.")
        return

    # ---------------------------------------------------
    # 9. Escribir archivo de salida
    # ---------------------------------------------------
    try:
        with open(ARCHIVO_SALIDA, 'w', encoding='utf-8') as f:
            if encabezado:
                f.write(encabezado)
                f.write("\n\n")

            for i, bloque in enumerate(bloques_encontrados):
                f.write(bloque)
                if i < len(bloques_encontrados) - 1:
                    f.write("\n\n")
    except Exception as e:
        print(f"[ERROR] No se pudo escribir el archivo de salida:")
        print(f"        {ARCHIVO_SALIDA}")
        print(f"        Detalle: {e}")
        return

    if bloques_encontrados:
        print(f"\n[OK] Se encontraron {len(bloques_encontrados)} bloques y se escribieron en {ARCHIVO_SALIDA}")
    else:
        print(f"\n[OK] Solo se escribió el encabezado en {ARCHIVO_SALIDA}")


def extraer_encabezado(contenido):
    patron_interfaz = r'export interface ConstanteMetadata \{(.*?)\}'
    match_interfaz = re.search(patron_interfaz, contenido, re.DOTALL)

    if match_interfaz:
        ruta_comentario = ARCHIVO_CONSTANTES.replace("\\", "\\\\")
        return f"// {ruta_comentario}\n\n{match_interfaz.group(0)}"
    return None


def extraer_bloque_completo(contenido, numero):
    pos_numero = contenido.find(str(numero))
    if pos_numero == -1:
        return None

    pos_inicio = contenido.rfind("// ==========================================", 0, pos_numero)
    if pos_inicio == -1:
        pos_inicio = 0

    pos_fin = contenido.find("// ==========================================", pos_inicio + 1)
    if pos_fin == -1:
        pos_fin = len(contenido)

    seccion = contenido[pos_inicio:pos_fin].strip()
    if not seccion:
        return None

    seccion = re.sub(r'\n\s*\n$', '', seccion)
    return seccion


if __name__ == "__main__":
    leer_constantes()
