export const DaD = {

    sourceElement: null,
    dragElement: null,
    lastDropElement: null,
    copyBadge: null,

    _startPoint: {x:0,y:0},
    _dragTollerance: 7,

    _logger: document.querySelector('logger'),
    log: function(text) {
        DaD._logger.innerText += text+'\n'
    },

    initialize: function() {
        DaD.createCopyBadge()
    },
    createCopyBadge: function() {
        let div = document.createElement('div')
        div.innerText = '+'
        div.style.display = 'none'
        div.style.pointerEvents = 'none'
        div.style.position = 'absolute'
        div.style.padding = '0 .3em'
        div.style.backgroundColor = 'orange'
        div.style.color = 'white'
        div.style.borderRadius = '50%'
        div.style.zIndex = 99992
        document.body.appendChild(div)
        DaD.copyBadge = div
    },
    createDragElement: function(original, x, y) {
        const clone = original.cloneNode(true);
        clone.style.position = 'absolute'
        clone.style.pointerEvents = 'none'
        clone.style.opacity = 0.75;
        clone.style.zIndex = 99991
        return clone;
    },
    
    moveDragElement: function(clone, x, y) {
        x = x - DaD._dragElementSize.width/2
        y = y - DaD._dragElementSize.height/2
        clone.style.left = x + 'px';
        clone.style.top = y + 'px';
        DaD.copyBadge.style.left = x-10 + 'px';
        DaD.copyBadge.style.top = y-10 + 'px';
    },
    
    getDropElementAt: function(x, y) {
        const el = document.elementFromPoint(x, y);
        if (!el) return null;
        return el.closest('[pca-droppable]');
    },

    hasParent: function(child, parent) {
        if (child==null || child==parent) return true
        let current = child.parentElement;
        while (current) {
            if (current === parent) return true;
            current = current.parentElement;
        }
        return false;
    },
    
    setupDragAndDrop: function(item, enable) {
        if (enable) {
            item._editable = item.getAttribute('editable')
            if (item._editable != null) item.setAttribute('editable',false)    
            item.addEventListener('mousedown', DaD.startDrag);
            item.addEventListener('touchstart', DaD.startDrag);
        } else {
            if (item._editable!=null) item.setAttribute('editable',item._editable)
            item.removeEventListener('mousedown', DaD.startDrag);
            item.removeEventListener('touchstart', DaD.startDrag);
        }
    },

    startDrag: function(e) {
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;

        DaD._dragCopyAndMove = !e.target.isDraggingCopyOnly()
        DaD.sourceElement = e.target.getDraggingElement()
        DaD.dragElement = DaD.createDragElement(DaD.sourceElement, touch.pageX, touch.pageY);
        DaD._startPoint.x = touch.pageX
        DaD._startPoint.y = touch.pageY

        document.addEventListener('mousemove', DaD.onMove);
        document.addEventListener('mouseup', DaD.endDrag);
        document.addEventListener('touchmove', DaD.onMove);
        document.addEventListener('touchend', DaD.endDrag);
    },

    onMove: function(e) {
        if (!DaD.dragElement) return;

        const touch = e.touches ? e.touches[0] : e;
        if (!DaD._dragging) {
            let dx = touch.pageX-DaD._startPoint.x
            let dy = touch.pageY-DaD._startPoint.y
            let dist = Math.sqrt(dx*dx+dy*dy)
            if (dist < DaD._dragTollerance) return
            document.body.appendChild(DaD.dragElement);
            let rect = DaD.dragElement.getBoundingClientRect()
            DaD._dragElementSize = {width: rect.width, height: rect.height}    
            DaD.checkAltKey(e)
            if (DaD._dragCopyAndMove) {
                document.addEventListener('keydown', DaD.checkAltKey);
                document.addEventListener('keyup', DaD.checkAltKey);
            } else DaD.copyBadge.style.display = 'block'
            DaD.sourceElement.unselect()
            DaD.dragElement.unselect()
        }
        DaD._dragging = true

        DaD.moveDragElement(DaD.dragElement, touch.pageX, touch.pageY);

        const currentDropElement = DaD.getDropElementAt(touch.clientX, touch.clientY);
        if (DaD.lastDropElement && DaD.lastDropElement !== currentDropElement)
            DaD.lastDropElement.classList.remove('drag-over');
        if (currentDropElement && currentDropElement !== DaD.lastDropElement)
            currentDropElement.classList.add('drag-over');
        DaD.lastDropElement = currentDropElement;
    },

    endDrag: function(e) {
        if (!DaD.dragElement) return;
            const touch = e.changedTouches ? e.changedTouches[0] : e;
            const lastDropElement = DaD.getDropElementAt(touch.clientX, touch.clientY);
            let youcandrop = !DaD.hasParent(lastDropElement, DaD.sourceElement)
            if (youcandrop && DaD._dragging && lastDropElement) {
                //console.log('DROPPING')
                if (DaD.sourceElement.unforceSpaces) DaD.sourceElement.unforceSpaces()
                let newElem = e.altKey?DaD.sourceElement.cloneNode(true):DaD.sourceElement;
                if (DaD.sourceElement.forceSpaces) DaD.sourceElement.forceSpaces()
                newElem.classList.add('dropped')
                newElem.setAttribute('pca-design','')
                newElem.classList.remove('drag-over')
                if (newElem.unforceSpaces) newElem.unforceSpaces()
                if (newElem.onDropping) newElem.onDropping(lastDropElement, lastDropElement)
                else lastDropElement.appendChild(newElem)
                lastDropElement.classList.add('highlight');
                setTimeout(() => {
                    lastDropElement.classList.remove('highlight')
                    newElem.classList.remove('dropped')
                }, 400);
            } else {
                DaD.log('NO DROPPING')
                DaD.log(e.target.tagName)
                if (e.target == lastDropElement || lastDropElement == e.target.parentNode ) {
                    if (DaD.selected && DaD.selected != DaD.sourceElement) DaD.selected.unselect()
                    DaD.selected = DaD.sourceElement
                    DaD.selected.toggleSelection()
                } else if (lastDropElement==null) DaD.sourceElement.remove()
            }

        DaD.dragElement.remove();
        DaD.dragElement = null;
        DaD.copyBadge.style.display = 'none'
        DaD._dragging = false

        if (DaD.lastDropElement) {
            DaD.lastDropElement.classList.remove('drag-over');
            DaD.lastDropElement = null;
        }

        document.removeEventListener('mousemove', DaD.onMove);
        document.removeEventListener('mouseup', DaD.endDrag);
        document.removeEventListener('touchmove', DaD.onMove);
        document.removeEventListener('touchend', DaD.endDrag);
        if (DaD._dragCopyAndMove) {
            document.removeEventListener('keydown', DaD.checkAltKey);
            document.removeEventListener('keyup', DaD.checkAltKey);
        }
    },

    checkAltKey: function(e) {
        if (e.altKey) DaD.copyBadge.style.display = 'block'
        else DaD.copyBadge.style.display = 'none'
    }

}
DaD.initialize()

