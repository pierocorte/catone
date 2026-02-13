/*
 *  Project name: PICO
 *  Author: PIERO CORTE
 *  File name: dad.js
 *  Description: Move and drag&drop functionality for DOM elements.
 *  Version: 1.2
 *  Date: 2025-01-01
 *  License: MIT
 */

import { PICO } from "./glob.mjs";

export const DAD = {}

let logger = document.querySelector('logger')
function LOG(msg) {if (logger) logger.innerHTML += msg+'<br>'}

DAD.setup = function(item, enable) {
    item.removeEventListener('pointerdown', item.onDown);
    let draggable = item.getAttribute('pca-draggable') != null;
    if (enable && draggable) {
        item.addEventListener('pointerdown', onDown);
        item.onDown = onDown
    }

    const offset = {x:0, y:0}
    const startPoint = {x:0, y:0}
    const dragTollerance = 7
    let dragAction = 'move' // 'move' or 'drag&move' or 'drag&copy'
    let dragging = false
    let dragSource = null
    let dragElement = null
    let dropTarget = null
    let copyBadge = createCopyBadge()
    let dragType = null
    let lastDropTarget = null

    function setDragElement(e) {
        dragType = dragSource.getAttribute('pca-draggable')
        if (dragSource && dragSource.getDragElement) dragElement = dragSource.getDragElement();
        if (!dragElement) dragElement = dragSource.cloneNode(true);
        let rect = dragSource.getBoundingClientRect();
        offset.x = e.pageX-rect.x-window.scrollX;
        offset.y = e.pageY-rect.y-window.scrollY;
        setGrabProperties();
        rect = dragElement.getBoundingClientRect();
        offset.x = rect.width-9;
        offset.y = rect.height-9;
        if (dragAction == 'drag&copy') copyBadge.style.display = 'block'
        if (dragAction == 'drag&move|copy') {
            checkAltKey(e)
            document.addEventListener('keydown', checkAltKey);
            document.addEventListener('keyup', checkAltKey);
        }
        // dragElement.setPointerCapture(e.pointerId);
    }

    function setGrabProperties() {
        if (!dragElement) return;
        dragElement.dragStyleProperties = {
            cursor: dragElement.style.cursor,
            // touchAction: dragElement.style.touchAction,
            position: dragElement.style.position,
            parentNode: dragElement.parentNode,
            left: dragElement.style.left,
            top: dragElement.style.top
        }
        dragElement.style.cursor = 'pointer';
        // dragElement.style.touchAction = 'none';
        // dragElement.style.pointerEvents = 'none'
        dragElement.style.position=  'absolute';
        document.body.appendChild(dragElement);
    }

    function resetGrabProperties() {
        if (!(dragElement && dragElement.dragStyleProperties)) return;
        dragElement.style.cursor = dragElement.dragStyleProperties.cursor;
        // dragElement.style.touchAction = dragElement.dragStyleProperties.touchAction;
        // dragElement.style.pointerEvents = dragElement.dragStyleProperties.pointerEvents;
        dragElement.style.position = dragElement.dragStyleProperties.position;
        dragElement.style.left = dragElement.dragStyleProperties.left;
        dragElement.style.top = dragElement.dragStyleProperties.top;
    }

    function moveDragElement(x, y) {
        dragElement.style.left = x-offset.x + 'px';
        dragElement.style.top = y-offset.y + 'px';
        copyBadge.style.left = x-offset.x-copyBadge.cx + 'px';
        copyBadge.style.top = y-offset.y-copyBadge.cy + 'px';
    }

    function getElementAt(x,y) {
        dragElement.style.pointerEvents = 'none' // set the property to exclude the dragElement when seaching by the next function: elementFromPoint(x,y)
        const el = document.elementFromPoint(x, y);
        dragElement.style.pointerEvents = '' // reset the property
        return el
    }

    function getDropTargetAt(x, y) {
        const el = getElementAt(x,y)
        if (!el) return null;
        if (dragType == '') return el.closest(`[pca-droppable]`);
        else {
            let droppable = el.closest(`[pca-droppable='${dragType}']`);
            if (droppable) return droppable;
            return el.closest(`[pca-droppable='']`);
        }
    }

    function hasParent(child, parent) {
        if (child==null || child==parent) return true
        let current = child.parentElement;
        while (current) {
            if (current === parent) return true;
            current = current.parentElement;
        }
        return false;
    }

    function createCopyBadge() {
        let div = document.createElement('div')
        div.innerText = '+'
        div.style.pointerEvents = 'none'
        div.style.position = 'absolute'
        div.style.padding = '0 .3em'
        div.style.backgroundColor = 'orange'
        div.style.color = 'white'
        div.style.borderRadius = '50%'
        div.style.zIndex = 99992
        document.body.appendChild(div)
        let rect = div.getBoundingClientRect()
        div.cx = rect.width/2;
        div.cy = rect.height/2;
        div.style.display = 'none'
        return div
    }

    function checkAltKey(e) {
        if (e.altKey) copyBadge.style.display = 'block'
        else copyBadge.style.display = 'none'
    }

    function onDown(e) {
        e.preventDefault();
        e.stopPropagation();
        dragSource = e.currentTarget;
        let x = startPoint.x = e.pageX
        let y = startPoint.y = e.pageY
        dragAction = dragSource.getAttribute('pca-drag-action')
        dragAction = dragAction!=null ? 'drag&'+dragAction : 'move';
        if (dragAction!='drag&none') document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
    }

    function onMove(e) {
        if (!dragging) {
            let dx = e.pageX-startPoint.x
            let dy = e.pageY-startPoint.y
            let dist = Math.sqrt(dx*dx+dy*dy)
            if (dist < dragTollerance) return
            dragging = true
            if (dragAction == 'move') {
                dragElement = dragSource
                let rect = dragElement.getBoundingClientRect();
                offset.x = e.pageX-rect.x-window.scrollX;
                offset.y = e.pageY-rect.y-window.scrollY;
                setGrabProperties();
            } else setDragElement(e);
            dragElement.classList.remove('selected');
            // dragElement.style.pointerEvents = 'none'
            // dragElement.style.touchAction = 'none'
        } else {
            moveDragElement(e.pageX, e.pageY);
            if (dragAction == 'move') return // no drop target for 'move' action
            const currentDropTarget = getDropTargetAt(e.pageX, e.pageY);
            if (lastDropTarget && lastDropTarget !== currentDropTarget)
                lastDropTarget.classList.remove('drag-over');
            if (currentDropTarget && currentDropTarget !== lastDropTarget)
                currentDropTarget.classList.add('drag-over');
            lastDropTarget = currentDropTarget;
        }
    }

    function onUp(e) {
        let dropElement = null
        if (dragging) {
            if (dragAction === 'move') {
                dragElement.dragStyleProperties.parentNode.appendChild(dragElement)
                resetGrabProperties();
            } else if (dragAction === 'drag&move') {
                dropTarget = getDropTargetAt(e.pageX, e.pageY)
                if (dropTarget && !hasParent(dropTarget, dragSource)) {
                    dropElement = dragSource
                    // dropTarget.appendChild(dropElement)
                } else if (dragSource.onDropOutside) dragSource.onDropOutside();
                dragElement.remove()
            } else if (dragAction === 'drag&copy') {
                dropTarget = getDropTargetAt(e.pageX, e.pageY)
                if (dropTarget) {
                    dropElement = dragElement
                    resetGrabProperties();
                    // DAD.setup(dropElement, true)
                    // dropTarget.appendChild(dropElement)
                } else dragElement.remove()
            } else if (dragAction === 'drag&move|copy') {
                dropTarget = getDropTargetAt(e.pageX, e.pageY)
                if (dropTarget) {
                    if (e.altKey) {
                        dropElement = dragElement
                        resetGrabProperties();
                        // DAD.setup(dropElement, true) 
                        // dropTarget.appendChild(dropElement)
                    } else {
                        if (!hasParent(dropTarget, dragSource)) {
                            dropElement = dragSource
                            // dropTarget.appendChild(dropElement)
                        }
                        dragElement.remove()
                    }
                } else {
                    dragElement.remove()
                    if (!e.altKey && dragSource.onDropOutside) dragSource.onDropOutside();
                }
            }
        } else DAD.select(e.target)
        if (dropElement) {
            DAD.drop(dropTarget,dropElement, getElementAt(e.clientX, e.clientY))
            dropElement.classList.add('highlight','dropped');
            setTimeout(() => {
                dropElement.classList.remove('highlight','dropped');
            }, 300);
        }
        // Cleanup
        LOG('CLEANUP')
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('keydown', checkAltKey);
        document.removeEventListener('keyup', checkAltKey);
        copyBadge.style.display = 'none'
        dragAction = 'move' // 'move' or 'drag&move' or 'drag&copy'
        dragging = false
        dragSource = null
        dragElement = null
        dropTarget = null
        dragType = null
        if (lastDropTarget) {
            lastDropTarget.classList.remove('drag-over');
            lastDropTarget = null;
        }
    }
}

DAD.drop = function(container, item, child) {
    if (item.onDropping) item.onDropping(container, child);
    else container.appendChild(item)
}

DAD.select = function(item) {
    if (DAD.lastSelected) DAD.lastSelected.classList.remove('selected');
    if (item && DAD.lastSelected != item) {
        item.classList.add('selected');
        DAD.lastSelected = item;
    } else DAD.lastSelected = null;
    PICO.setSelected(DAD.lastSelected);
}

