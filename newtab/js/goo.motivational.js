import {goo} from './goo.js';

const MOTIVATIONAL_SENTENCES = [
  'Go you!',
  'Take a moment, have a deep breath.',
  'Think of something to be grateful for.',
  'You are appreciated.',
  'You are not defined by what you think, but by what you do with what you think.',
  'Breathe in... Breathe out...',
  'Today, have you told someone that you appreciate them?',
  'Take a step back.',
  'What\'s next?',
  'Don\'t stop trying.'
];

export class Motivational {
  render() {
    return `
      ${this.getMotivationalSentence()}
    `;
  }

  getMotivationalSentence() {
    return MOTIVATIONAL_SENTENCES[this.dayOfYear() % MOTIVATIONAL_SENTENCES.length];
  }

  dayOfYear(date) {
    if (date == null) date = new Date();
    return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
  }
}
