// const EventEmitter = require('events');

// class Eventer extends EventEmitter {}

// const eventer = new Eventer();

'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events');

var Eventer = function (_EventEmitter) {
  _inherits(Eventer, _EventEmitter);

  function Eventer() {
    _classCallCheck(this, Eventer);

    return _possibleConstructorReturn(this, (Eventer.__proto__ || Object.getPrototypeOf(Eventer)).apply(this, arguments));
  }

  return Eventer;
}(EventEmitter);

var eventer = new Eventer();



module.exports = eventer;

eventer.on('app-eventer-ready', () => {
  console.log('Eventer ready to use');
  eventer.emit('app-start-websocket');
});