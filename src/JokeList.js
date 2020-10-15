import React, { Component } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './JokeList.css';
import Joke from './Joke'

export class JokeList extends Component {
  static defaultProps={
    numJokes: 10,
  }
  constructor(props){
    super(props);
    this.state ={
      jokes: JSON.parse(window.localStorage.getItem('jokes') || '[]'),
      loading: false,
    }
    this.seenJokes = new Set(this.state.jokes.text)
    this.handleVote = this.handleVote.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount(){
    if(this.state.jokes === 0){
      this.getJokes()
    }
  }

  async getJokes(){
    try {
      let jokes = [];
        while(jokes.length < this.props.numJokes){
        let res = await axios.get('https://icanhazdadjoke.com/', {headers: {Accept: 'application/json'}});
        if(!this.seenJokes.has(res.data.joke)){
          jokes.push({text: res.data.joke, votes: 0, id: uuidv4()});
        } else {
          console.log('Duplicate Joke')
        }
      }
      this.setState(state => ({
        jokes: [...state.jokes, ...jokes],
        loading: false,
      }))
      window.localStorage.setItem('jokes', JSON.stringify(jokes));
    } catch(err) {
      alert(err);
      this.setState({loading: false})
    }
  }

  handleVote(id, delta){
    this.setState(state => ({
      jokes: state.jokes.map(j => j.id === id ? {...j, votes: j.votes + delta} : j)
    }), window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes)) 
    )
  }

  handleClick(){
    this.setState({loading: true}, this.getJokes)
  }

  render() {
    if(this.state.loading){
      return(
        <div className='JokeList-Spinner'>
          <i className='far fa-8x fa-laugh fa-spin'/>
          <h1 className='JokeList-Title'>Loading...</h1>
        </div>
      )
    } 
    let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes)
    return (
      <div className='JokeList'>
        <div className='JokeList-Sidebar'>
          <h1 className='JokeList-Title'><span>Dad</span> Jokes...</h1>
          <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' />
          <button className='JokesList-GetMore' onClick={this.handleClick}>Get New Jokes</button>
        </div>
        
        <div className='JokeList-Joke'>
          {jokes.map(joke => <Joke votes={joke.votes} joke={joke.text} key={joke.id} upvote={() => this.handleVote(joke.id, 1)} downvote={() => this.handleVote(joke.id, -1)}/>)}
        </div>
      </div>
    )
  }
}

export default JokeList
