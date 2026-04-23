# Draft to API Editor

Editor basado en React expuesto como `Web Component` para usarlo desde HTML normal.

## Objetivo

- usar el editor como `<draft-to-api-editor>`
- soportar multiples instancias
- integrarlo en formularios con `input type="hidden"`
- poder consumirlo desde proyectos sin React

## Desarrollo

```bash
npm install
npm run dev
```

Paginas utiles en local:

- `http://localhost:5173/`
- `http://localhost:5173/web-component-test.html`

## Comandos

```bash
npm run dev
npm run build
npm run build:web-component
npm run lint
```

## Uso del componente

```html
<draft-to-api-editor
  name="body"
  value="Texto inicial"
  placeholder="Escribe aqui..."
></draft-to-api-editor>
```

API publica:

- atributos: `name`, `value`, `placeholder`, `disabled`, `readonly`, `required`
- propiedades: `element.value`, `element.disabled`, `element.readOnly`
- metodos: `focus()`, `getMarkdown()`, `setMarkdown(value)`
- eventos: `input`, `change`, `ready`

## Build distribuible

```bash
npm run build:web-component
```

Salida:

- `dist/editor.js`
- `dist/editor.css`

## Pruebas manuales

La pagina `web-component-test.html` sirve para validar el caso basico de uso en HTML plano:

- dos campos iguales
- escritura libre en ambos
- submit de formulario
- visualizacion del output enviado en pantalla
