/*
 * Goo.js v0.1.1
 *
 * Inefficient, minimalist, JS renderer for lightweight components.
 * Try to imitate a React-inspired component structure without any extra lib.
 * Use only for local, controlled, small projects.
 * All the components are automatically wrapped in a div.
 *
 * USAGE:
 *    import {goo} from './goo.js';
 *    import {Component} from './goo.component.js'; // any goo-compatible component (has toString with return value)
 *    goo.root(Component, '#id'); // CSS selector, best use an id
 *
 * From inside a component:
 *    goo.render(Component, data); // to render another component, data can be anything
 *    goo.refresh(this); // to refresh the entire sub-tree from the current component down
 *    goo.onClick(function); // attach an event listener in a rendered string (remember to .bind(this))
 *
 * EXAMPLE:
 *    class MyRootClass {
 *      render() {
 *        return `
 *          <div ${goo.onClick(this.myClick.bind(this))}>
 *            ${goo.render(MyComponentClass, this.data)}
 *          </div>
 *        `;
 *      }
 *      myClick() {
 *        goo.refresh(this);
 *      }
 *    }
 */

class Goo {
  constructor() {
    this.currentId = 0;
    this.currentListenerId = 0;
    this.listenerQueue = [];
  }

  root(gooClass, gooDOM) {
    if (gooDOM) {
      this.rootObject = new gooClass();
      if (gooDOM.constructor.name == 'String') {
        this.rootDOM = document.querySelector(gooDOM);
      } else if (gooDOM.constructor.name == 'HTMLDivElement') {
        this.rootDOM = gooDOM;
      } else {
        throw 'The DOM node parameter must be "String" or "HTMLDivElement".';
      }
      this.refresh();
    } else {
      throw 'Please specify the DOM object to attach to.';
    }
  }

  render(gooClass, data) {
    let gooObject = new gooClass(data);
    this.currentId++;
    Object.defineProperty(gooObject, 'gooId', { value: this.currentId, enumerable: false, writable: false });
    return '<div class="' + gooObject.constructor.name.toLowerCase() + '" data-goo="' + gooObject.gooId + '">' + gooObject.render() + '</div>';
  }

  refresh(gooObject) {
    if (gooObject && gooObject.gooId) {
      // Refresh only passed component subtree
      document.querySelectorAll('[data-goo="' + gooObject.gooId + '"]')[0].innerHTML = gooObject.render();
    } else {
      // Hard refresh, from root
      this.rootDOM.innerHTML = this.rootObject.render();
    }

    // The innerHTML assignment is sync, so we can safely attach the event
    // handlers right after.
    while (this.listenerQueue.length > 0) {
      let handler = this.listenerQueue.shift();
      document.querySelectorAll('[data-goo-on-click="' + handler.id + '"]')[0].addEventListener('click', handler.function);
    }
  }

  onClick(fx) {
    this.currentListenerId++;
    this.listenerQueue.push({ id: this.currentListenerId, function: fx });
    return ' data-goo-on-click="' + this.currentListenerId + '"';
  }
}

export let goo = new Goo();
