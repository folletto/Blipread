import {Options} from './goo.options.js';
import {goo} from './goo.js';

window.onload = function() {
  goo.root(Options, '#root');
}
