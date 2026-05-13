🧠 1. Single (Respuesta única)
📌 Descripción

Una pregunta donde solo una opción es correcta.

⚙️ Cómo implementarlo
answers: lista de opciones
Solo una debe tener isCorrect: true
Todas con:
drag: false
correctOrder: 0 (no se usa)
✅ Evaluación
Si el usuario selecciona la correcta → suma puntos
Si no → 0 puntos
🧠 2. MultipleChoice (Múltiple opción)
📌 Descripción

Puede haber varias respuestas correctas.

⚙️ Cómo implementarlo
answers: varias opciones
Varias con isCorrect: true
Todas con:
drag: false
✅ Evaluación

Modo estricto

Debe seleccionar todas las correctas y ninguna incorrecta

Modo parcial (recomendado)

Sumar puntos por cada correcta seleccionada
Opcional: penalizar incorrectas
🧠 3. TrueOrFalse
📌 Descripción

Una afirmación con dos opciones:

Verdadero
Falso
⚙️ Cómo implementarlo
answers:
"Verdadero"
"Falso"
Solo uno con isCorrect: true
drag: false
✅ Evaluación
Igual que Single
🧠 4. ShortAnswer (Respuesta corta)
📌 Descripción

El usuario escribe una respuesta libre.

⚙️ Cómo implementarlo
answers contiene las respuestas válidas
Todas las válidas con isCorrect: true
drag: false
✅ Evaluación

Comparar el texto ingresado con:

answer.text
💡 Recomendaciones
Ignorar mayúsculas/minúsculas
Eliminar espacios al inicio y final (trim)
Permitir múltiples respuestas válidas (sinónimos)
🧠 5. DragAndDropOrder (Ordenar elementos)
📌 Descripción

El usuario debe ordenar elementos en el orden correcto.

⚙️ Cómo implementarlo
answers contiene los elementos
Todos con:
drag: true
correctOrder con el orden correcto (1, 2, 3...)
📊 Ejemplo conceptual
BIOS → 1
Bootloader → 2
Kernel → 3
✅ Evaluación

Comparar:

orden del usuario vs correctOrder
Opciones de puntaje
Todo correcto → puntaje completo
Parcial → puntaje proporcional