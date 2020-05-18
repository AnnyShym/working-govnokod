import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import Video from './Video';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';
import makeUnique from '../../../modules/make_unique';
import yandexKey from '../../../modules/yandex_key';

import '../../../styles/key_word.css';

const language = "en-ru";

class VideoWithKeyWords extends Component { 

    constructor(props) {

        super(props);

        this.state = {
            word: "",
            translation: "",
            allowed: true,
            errors: []
        };

    } 

    handleCueChange = e => {

        let words = null;
        if ([...e.target.track.activeCues].map(t => t.text)
            .join(" ")
            .toLowerCase()
            .replace(/(<.*?>)+/gi, '')
            .match(/[a-z'\-]+/gi) !== null) {

            words = [...e.target.track.activeCues].map(t => t.text)
            .join(" ")
            .toLowerCase()
            .replace(/(<.*?>)+/gi, '')
            .match(/[a-z'\-]+/gi)
            .filter(makeUnique);

        }

        let divKeyWords = document.getElementById("key-words");
        let divBlock = document.createElement('div');
        divBlock.setAttribute('id', "key-words");
        divBlock.setAttribute('class', "d-flex mb-5");

        if (words !== null) {

            for(let i = 0; i < words.length; i++) {

                let divMain = document.createElement('div');
                divMain.setAttribute('class', "container p-2 px-3 border rounded m-1 d-flex justify-content-between key-word");
                divMain.setAttribute('id', `${words[i]}-container`);
                divMain.onclick = e => this.onClickWord(e);
                let divLeft = document.createElement('div');
                divLeft.setAttribute('id', words[i]);
                let div = document.createElement('div');                
                div.innerHTML = words[i];
                let divRight = document.createElement('div');
                divRight.setAttribute('id', `${words[i]}-add-btn`);
                divRight.setAttribute('class', "h-100 d-flex flex-column justify-content-center");

                divLeft.append(div);
                divMain.append(divLeft);
                divMain.append(divRight);
                divBlock.append(divMain);

            }  

        }

        divKeyWords.replaceWith(divBlock);

    }

    onClickWord = (e) => {

        const word = e.target.innerHTML;

        axios.get(`https://translate.yandex.net/api/v1.5/tr.json/translate?key=${yandexKey}&lang=${language}&text=${word}`)
        .then((response) => {

            const translation = response.data.text[0];

            let divLeft = document.getElementById(word);
            let div = document.createElement('div');
            div.innerHTML = translation;
            divLeft.append(div);

            let divRight = document.getElementById(`${word}-add-btn`);
            let divButton = document.createElement('div');
            divButton.setAttribute('class', "font-weight-older add-btn mb-2");
            divButton.innerHTML = "+";
            divButton.onclick = e => this.onClickAddWord(e);

            divRight.append(divButton);

            this.setState({ 
                word: e.target.innerHTML,
                translation: translation 
            });

        })
        .catch((error) =>
            console.log(error)
        );

    }

    onClickAddWord = (e) => {

        const body = {
            word: this.state.word,
            translation: this.state.translation
        };

        axios.post(`${serverAddress}key-words/add`, body,
            {withCredentials: true})
        .then(response => {
            let divMain = document.getElementById(`${this.state.word}-container`);
            divMain.setAttribute('class', "container p-2 px-3 border rounded m-1 d-flex justify-content-between bg-secondary key-word");
            this.setState({
                allowed: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                statusCodes.UNAUTHORIZED) {
                this.setState({
                    allowed: false,
                    errors: err.response.data.errors
                });
            }
            else {
                this.setState({
                    errors: err.response.data.errors
                });
            }
        })

    }

    render() {

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }

        return(

            <div>
                <Video episode_id={ this.props.episode_id } onCueChange={ this.handleCueChange } />
                <div id="key-words">
                </div>
            </div>

        );

    }

}

export default VideoWithKeyWords;
