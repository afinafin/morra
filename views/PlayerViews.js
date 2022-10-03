import React from 'react';

const exports = {};

// Player views must be extended.
// It does not have its own Wrapper view.

exports.GetHand = class extends React.Component {
  render() {
    const {parent, playable, hand} = this.props;
    return (
      <div>
        {hand ? 'It was a miss! Pick again.' : ''}
        <br />
        {!playable ? 'Please wait...' : ''}
        <br />
        <button
          disabled={!playable}
          onClick={() => parent.playHand('ONE')}
        >One</button>
        <button
          disabled={!playable}
          onClick={() => parent.playHand('TWO')}
        >Two</button>
        <button
          disabled={!playable}
          onClick={() => parent.playHand('THREE')}
        >Three</button>
      </div>
    );
  }
}

exports.GetGuess = class extends React.Component {
  render() {
    const {parent, playable, guess} = this.props;
    return (
      <div>
        {hand ? 'It was a miss! Guess again.' : ''}
        <br />
        {!playable ? 'Please wait...' : ''}
        <br />
        <button
          disabled={!playable}
          onClick={() => parent.guessHand('ONE')}
        >One</button>
        <button
          disabled={!playable}
          onClick={() => parent.guessHand('TWO')}
        >Two</button>
        <button
          disabled={!playable}
          onClick={() => parent.guessHand('THREE')}
        >Three</button>
        <button
          disabled={!playable}
          onClick={() => parent.guessHand('FOUR')}
        >Four</button>
        <button
          disabled={!playable}
          onClick={() => parent.guessHand('FIVE')}
        >Five</button>
        <button
          disabled={!playable}
          onClick={() => parent.guessHand('SIX')}
        >Six</button>
        </div>
    );
  }
}

exports.WaitingForResults = class extends React.Component {
  render() {
    return (
      <div>
        Waiting for results...
      </div>
    );
  }
}

exports.Done = class extends React.Component {
  render() {
    const {outcome} = this.props;
    return (
      <div>
        Thank you for playing. The outcome of this game was:
        <br />{outcome || 'Unknown'}
      </div>
    );
  }
}

exports.Timeout = class extends React.Component {
  render() {
    return (
      <div>
        There's been a timeout. (Someone took too long.)
      </div>
    );
  }
}

export default exports;