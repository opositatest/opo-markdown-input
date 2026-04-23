# Plan: Editor como Web Component tipo input

## Objetivo

Convertir el editor actual en un `Web Component` reutilizable que:

- se use como un campo de formulario
- pueda existir varias veces en la misma pagina
- funcione en proyectos que no usan React, como Sonata PHP
- mantenga React como tecnologia interna

## Enfoque tecnico

- Usar `React dentro de Web Component`
- Primera version sin `Shadow DOM`
- Integracion con formularios mediante un `input type="hidden"` sincronizado
- Cada instancia del componente mantiene su propio estado y su propio root de React

## Objetivos funcionales

El componente debe:

1. Renderizarse como `<draft-to-api-editor>`
2. Aceptar `name`, `value`, `disabled`, `required`, `readonly`, `placeholder`
3. Sincronizar su valor como si fuera un input real
4. Poder montarse varias veces en la misma pagina sin compartir estado
5. Emitir eventos tipo `input` y `change`
6. Desmontarse correctamente al salir del DOM

## Decisiones iniciales

### 1. Tecnologia

- Mantener React internamente
- Exponer una API HTML/DOM para el consumidor
- No exigir React en el proyecto que lo consume

### 2. DOM

- Empezar con `light DOM`
- Evitar `Shadow DOM` en la primera fase por compatibilidad con estilos globales de BlockNote, KaTeX y MathQuill

### 3. Integracion con formularios

- El componente creara y mantendra un `input type="hidden"`
- Ese input usara el atributo `name` del componente
- El valor enviado por formulario sera el Markdown

### 4. Persistencia

- El autosave a `localStorage` no formara parte del core inicial
- Si se necesita, se hara opcional y por instancia

### 5. Sincronizacion

- El campo se sincronizara automaticamente
- No dependera del boton `Exportar` para actualizar el valor del formulario

## API publica prevista

### Atributos

- `name`
- `value`
- `placeholder`
- `disabled`
- `readonly`
- `required`

### Propiedades JS

- `element.value`
- `element.disabled`
- `element.readOnly`

### Metodos

- `focus()`
- `getMarkdown()`
- `setMarkdown(value)`

### Eventos

- `input`
- `change`
- `ready`

## Requisitos para multiples instancias

Cada instancia debe tener:

- un `createRoot` propio
- un estado propio
- un `hidden input` propio
- configuracion propia
- listeners propios

No debe existir:

- una clave global unica de `localStorage`
- estado compartido entre instancias
- ids globales reutilizados sin control
- listeners globales que mezclen instancias

## Refactor necesario

### 1. Extraer un componente reutilizable

Crear un componente React tipo `EditorField` que reciba por props:

- `value`
- `defaultValue`
- `onChange`
- `disabled`
- `readonly`
- `placeholder`

### 2. Separar logica de app y logica de campo

Sacar del componente reutilizable todo lo que sea propio de la app actual:

- `react-router-dom`
- `@tanstack/react-query`
- `App.tsx`
- providers globales no necesarios
- toasts obligatorios

### 3. Revisar el comportamiento actual del editor

Adaptar o eliminar del core reutilizable:

- `localStorage`
- `navigator.clipboard`
- boton `Exportar Markdown`
- feedback con `sonner`

## Implementacion del Web Component

El custom element debe:

1. Registrarse como `draft-to-api-editor`
2. Crear un contenedor interno para React
3. Crear y sincronizar un `input type="hidden"`
4. Montar `EditorField` con `createRoot`
5. Escuchar cambios de atributos como `value` o `disabled`
6. Desmontar React en `disconnectedCallback`

## Comportamiento tipo input

El componente debe comportarse de forma parecida a un input HTML:

- aceptar valor inicial
- permitir leer y asignar `value`
- emitir `input` cuando cambie el contenido
- emitir `change` cuando corresponda
- respetar `disabled` y `readonly`
- participar correctamente en el envio del formulario a traves del `hidden input`

## Integracion objetivo en PHP / Sonata

Uso esperado en Twig o Sonata:

```html
<draft-to-api-editor
  name="body"
  value="Texto inicial"
  placeholder="Escribe aqui..."
></draft-to-api-editor>

<draft-to-api-editor
  name="summary"
  value="Resumen inicial"
></draft-to-api-editor>
```

Cada instancia enviara su propio valor dentro del formulario como si fuera un campo independiente.

## Riesgos conocidos

1. Estilos globales

- `@blocknote/mantine/style.css`
- `katex/dist/katex.min.css`
- estilos de `react-mathquill`

Estos estilos encajan mejor en `light DOM` durante la primera fase.

2. Overlays y menus

- slash menu
- popups
- tooltips
- toasts

Habra que comprobar que su posicionamiento y z-index funcionen correctamente al incrustarlo en paginas externas.

3. Persistencia actual

- La clave `draft-to-api-content` no sirve para multiples instancias

## Fases de trabajo

### Fase 1. Extraer el editor reutilizable

- Crear `EditorField`
- Separar la logica de campo de la logica de app
- Eliminar dependencias innecesarias del runtime reutilizable

### Fase 2. Hacerlo controlable

- Soportar `value` y `onChange`
- Soportar `disabled`, `readonly` y `placeholder`
- Sincronizar a Markdown automaticamente

### Fase 3. Crear el Web Component

- Implementar `draft-to-api-editor`
- Crear `hidden input`
- Exponer API publica y eventos DOM

### Fase 4. Soportar multiples instancias

- Probar dos o mas editores en la misma pagina
- Verificar independencia de estado
- Verificar envio correcto del formulario

### Fase 5. Packaging

- Generar bundle distribuible para npm y assets consumibles desde PHP
- Preparar `editor.js` y `editor.css`

### Fase 6. Validacion en Sonata

- Probar render en plantilla Twig
- Probar guardado en formulario Sonata
- Probar edicion, submit y reset

## Casos de prueba minimos

1. Una instancia con valor inicial
2. Dos instancias con nombres distintos
3. Submit de formulario con ambos valores
4. `form.reset()`
5. Cambio programatico de `value`
6. Desmontaje y remontaje del componente
7. Estado `disabled` y `readonly`

## Resultado esperado

Al final de esta implementacion deberiamos tener un editor reutilizable que:

- siga desarrollado en React
- se consuma como HTML normal
- funcione en Sonata PHP sin requerir React en el proyecto consumidor
- soporte multiples instancias en una misma pagina
- se comporte de cara al formulario como un input especializado
