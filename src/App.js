import React, { Component } from 'react';
import './App.css';
import Header from './components/header';
import Character from './components/character';
import Paginator from './components/paginator';

const getMarvelCharactersCall = (offset) =>
  fetch(`https://gateway.marvel.com/v1/public/characters?apikey=${process.env.REACT_APP_PUBLIC_API_KEY}&offset=${offset}`)
    .then(res => res.json())
    .then((resObj) => {
      try {
        if (resObj.code === 200) {
          if (offset > resObj.data.total) {
            throw new Error('Page does not exist.');
          } else {
            const pages = Math.floor(resObj.data.total / 20);
            return {
              characters: resObj.data.results,
              maxPage: resObj.data.total % 20 > 0 ? pages+1 : pages,
            };
          }
        } else {
          throw new Error(`Marvel API bad response. Status code ${resObj.code}.`);
        }
      } catch(e) {
        console.error(e);
        return {
          characters: [],
          maxPage: 0,
        };
      }
    });

class App extends Component {
  state = {
    characters: [],
    page: 0,
    maxPage: 0,
  };

  componentWillMount() {
    getMarvelCharactersCall(0).then(({characters, maxPage}) => {
      this.setState({ characters, page: 1, maxPage });
    });
  }

  changePage = (page) => {
    if(page !== this.state.page) {
      const offset = (page-1)*20;
      getMarvelCharactersCall(offset).then(({ characters, maxPage }) => {
        this.setState({ characters, page, maxPage });
      });
    }
  }

  nextPages = (maxPage) => {
    this.changePage(maxPage+1);
  }

  previousPages = (minPage) => {
    if(minPage > 1) {
      this.changePage(minPage-1)
    }
  }

  render() {
    //TODO: Define an error messages container.
    return (
      <div className="App">
        <Header />
        <nav className="navbar App-navbar">
          <ul className="nav navbar-nav">
            <li className="active"><a href="#"><span className="h4">Characters</span></a></li>
            {/*<li><a href="#"><span className="h4">Comics</span></a></li>*/}
          </ul>
        </nav>
        <div className="App-body">
          {
            this.state.characters
              // .filter(c => /^(.(?!image_not_available$))+$/.test(c.thumbnail.path))
              .map(c => <Character key={c.id} instance={c} />)
          }
          <Paginator page={this.state.page}
                     maxPage={this.state.maxPage}
                     onChangePage={this.changePage}
                     onNext={this.nextPages}
                     onPrevious={this.previousPages} />
        </div>
      </div>
    );
  }
}

export default App;
