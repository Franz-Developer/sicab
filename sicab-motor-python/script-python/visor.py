# C:\sistemas\sicab\sicab-motor-python\script-python\visor.py
import os
import sys
import pygame
from PIL import Image
import tkinter as tk
from tkinter import filedialog

# --- SELECCIÓN DE CARPETA MEDIANTE DIÁLOGO NATIVO ---
def seleccionar_carpeta():
    root = tk.Tk()
    root.withdraw() # Oculta la ventana pequeña e innecesaria de tkinter
    root.attributes('-topmost', True) # Asegura que el diálogo aparezca al frente

    # Abre el buscador de carpetas de Windows
    carpeta_elegida = filedialog.askdirectory(title="Selecciona la carpeta con imágenes")
    root.destroy()
    return carpeta_elegida

CARPETA = seleccionar_carpeta()

# Si el usuario cierra el diálogo o cancela, salimos limpiamente
if not CARPETA:
    print("Selección de carpeta cancelada por el usuario.")
    sys.exit()

SOPORTADOS = (".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp")

pygame.init()

# Obtiene la resolución nativa de tu monitor actual
info = pygame.display.Info()
ANCHO, ALTO = info.current_w, info.current_h

# Inicializa en Pantalla Completa (FULLSCREEN)
pantalla = pygame.display.set_mode((ANCHO, ALTO), pygame.FULLSCREEN)
pygame.display.set_caption("Visor de Imágenes")
reloj = pygame.time.Clock()

imagenes = sorted([os.path.join(CARPETA, f) for f in os.listdir(CARPETA) if f.lower().endswith(SOPORTADOS)])
if not imagenes:
    # Cerramos Pygame temporalmente para mostrar el error limpio en consola
    pygame.quit()
    print(f"No hay imágenes soportadas en: {CARPETA}")
    sys.exit()

indice = 0
img_original = None
img_actual = None
zoom = 1.0
pos_x, pos_y = 0, 0

def cargar_imagen(idx):
    global img_original, img_actual, zoom, pos_x, pos_y
    try:
        pil_img = Image.open(imagenes[idx]).convert("RGBA")
        tamano = pil_img.size
        datos = pil_img.tobytes()
        img_original = pygame.image.fromstring(datos, tamano, pil_img.mode)
        # Ajusta la imagen al tamaño completo de la pantalla al cargar
        zoom = min(ANCHO / tamano[0], ALTO / tamano[1])
        pos_x = (ANCHO - (tamano[0] * zoom)) // 2
        pos_y = (ALTO - (tamano[1] * zoom)) // 2
        actualizar_escala()
    except Exception as e:
        print(f"Error al cargar {imagenes[idx]}: {e}")

def actualizar_escala():
    global img_actual
    w = int(img_original.get_width() * zoom)
    h = int(img_original.get_height() * zoom)
    if w > 0 and h > 0:
        img_actual = pygame.transform.smoothscale(img_original, (w, h))

cargar_imagen(indice)

while True:
    teclas = pygame.key.get_pressed()

    # Movimiento continuo con las flechas
    paso = 15
    if teclas[pygame.K_UP]: pos_y += paso
    if teclas[pygame.K_DOWN]: pos_y -= paso
    if teclas[pygame.K_LEFT] and (teclas[pygame.K_LSHIFT] or teclas[pygame.K_RSHIFT]): pos_x += paso
    if teclas[pygame.K_RIGHT] and (teclas[pygame.K_LSHIFT] or teclas[pygame.K_RSHIFT]): pos_x -= paso

    for evento in pygame.event.get():
        if evento.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

        elif evento.type == pygame.KEYDOWN:
            # Presiona ESC para salir de la pantalla completa y cerrar el programa
            if evento.key == pygame.K_ESCAPE:
                pygame.quit()
                sys.exit()

            # Cambio de imagen con flechas Izquierda / Derecha directas (sin Shift)
            elif evento.key == pygame.K_RIGHT and not (teclas[pygame.K_LSHIFT] or teclas[pygame.K_RSHIFT]):
                indice = (indice + 1) % len(imagenes)
                cargar_imagen(indice)
            elif evento.key == pygame.K_LEFT and not (teclas[pygame.K_LSHIFT] or teclas[pygame.K_RSHIFT]):
                indice = (indice - 1) % len(imagenes)
                cargar_imagen(indice)

            # Zoom con '+' y '-'
            elif evento.key in (pygame.K_PLUS, pygame.K_KP_PLUS, pygame.K_MINUS, pygame.K_KP_MINUS):
                factor = 1.15 if evento.key in (pygame.K_PLUS, pygame.K_KP_PLUS) else 0.85
                cx, cy = pos_x + img_actual.get_width() / 2, pos_y + img_actual.get_height() / 2
                zoom *= factor
                actualizar_escala()
                pos_x = cx - img_actual.get_width() / 2
                pos_y = cy - img_actual.get_height() / 2

    pantalla.fill((15, 15, 15))
    if img_actual:
        pantalla.blit(img_actual, (pos_x, pos_y))
    pygame.display.flip()
    reloj.tick(60)
