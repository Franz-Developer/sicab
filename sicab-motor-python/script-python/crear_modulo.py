# C:\sistemas\sicab\sicab-motor-python\script-python\crear_modulo.py
import os
import sys

def crear_estructura_modulo(nombre_plural, nombre_singular):
    # Normalizamos a kebab-case (guiones medios)
    nombre_plural_kebab = nombre_plural.replace('_', '-').lower()
    nombre_singular_kebab = nombre_singular.replace('_', '-').lower()

    base_dir = r"C:\sistemas\sicab\sicab-backend\src\modules"
    modulo_dir = os.path.join(base_dir, nombre_plural_kebab)

    if os.path.exists(modulo_dir):
        print(f"[ERROR] La carpeta ya existe: {modulo_dir}")
        return

    # Creamos las carpetas
    os.makedirs(os.path.join(modulo_dir, 'dto'), exist_ok=True)
    os.makedirs(os.path.join(modulo_dir, 'entities'), exist_ok=True)
    print(f"Carpetas creadas para: {nombre_plural_kebab}")

    # Generamos los nombres PascalCase para las clases
    NombreClasePlural = "".join(p.capitalize() for p in nombre_plural_kebab.split('-'))
    NombreClaseSingular = "".join(p.capitalize() for p in nombre_singular_kebab.split('-'))

    # Lista de archivos
    archivos = [
        f"dto/create-{nombre_singular_kebab}.dto.ts",
        f"dto/find-{nombre_plural_kebab}-query.dto.ts",
        f"dto/{nombre_singular_kebab}-response.dto.ts",
        f"dto/update-{nombre_singular_kebab}.dto.ts",
        f"entities/{nombre_singular_kebab}.entity.ts",
        f"{nombre_plural_kebab}.controller.ts",
        f"{nombre_plural_kebab}.module.ts",
        f"{nombre_plural_kebab}.service.ts",
        f"{nombre_plural_kebab}.http"
    ]

    # Creamos los archivos vacíos
    for archivo in archivos:
        ruta_archivo = os.path.join(modulo_dir, archivo)
        with open(ruta_archivo, 'w', encoding='utf-8') as f:
            pass
        print(f"  - Creado: {archivo}")

    print(f"\n🎉 ¡Módulo '{nombre_plural_kebab}' creado con éxito!")
    print(f"   -> Clase Entidad (Singular): {NombreClaseSingular}")
    print(f"   -> Clase Módulo (Plural):    {NombreClasePlural}Module")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        nombre_pl = sys.argv[1].strip()
        nombre_sg = sys.argv[2].strip()
        crear_estructura_modulo(nombre_pl, nombre_sg)
    else:
        print("Debes proporcionar el nombre en plural y en singular.")
        print("Ej: python crear_modulo.py vacunos_historial_aretes vacuno_historial_arete")
