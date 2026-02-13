export const PICO = {}

PICO.config = {
    bg: 'hsl(0 0 90/.9)',
    fg: 'hsl(0 0 0/.9)',
    justify: 'left',
    th: 'hsla(220 90 60/.9)',
}

PICO.setSelected = function(target) {
    PICO.lastSelected = target
    document.querySelector('pc-component-property-editor').setTarget(target)
}
