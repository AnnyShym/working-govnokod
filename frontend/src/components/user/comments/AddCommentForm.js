import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import Picker from 'emoji-picker-react';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/comment.css';

const MAX_LENGTH = 2200;
const LENGTH_MSG = "You have exceeded the allowed number of characters!";

class AddCommentForm extends Component {

    constructor(props) {

        super(props);

        this.state = {
            content: "",
            allowed: true,
            expanded: false,
            errors: []
        };

        this.socket = socketIOClient(serverAddress);

    }

    onSubmit = () => {

        const content = this.state.content.trim();

        if (content.length === 0) {
            return;
        }

        if (content.length <= MAX_LENGTH) {

            const token = document.cookie.replace(/(?:(?:^|.*;\s*)user_auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");

            this.socket.emit('add comment', this.props.about, this.props.id, 
                content, token);
            this.socket.on('add comment', (res) => {
                if (res.statusCode !== statusCodes.CREATED) {
                    console.log(`${res.statusCode}: ${res.errors}`);
                    if (res.statusCode === statusCodes.UNAUTHORIZED) {
                        this.setState({
                            allowed: false,
                            expanded: false,
                            errors: res.errors
                        });
                    }
                    if (res.statusCode === statusCodes.INTERNAL_SERVER_ERROR ||
                        res.statusCode === statusCodes.BAD_REQUEST) {
                        this.setState({
                            expanded: false,
                            errors: res.errors
                        });
                    }
                }
                else {
                    this.setState({
                        content: "",
                        expanded: false,
                        allowed: true,
                        errors: []
                    });                
                }
            });

        }
        else {
            this.setState({
                errors: [{ msg: LENGTH_MSG }]
            });    
        }

    }

    onChangeContent = (e) => {
        this.setState({
            content: e.target.value
        });
    }

    onEmojiClick = (e, emojiObject) => {
        this.setState({
            content: `${ this.state.content }${emojiObject.emoji}`
        });
    }

    render() {

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }

        const errorBlocks = this.state.errors.map((error, index) =>
            <div key={ index } className="alert alert-danger">{ error.msg }</div>
        );

        return(

            <div className="d-flex flex-column">
                <div className="d-flex justify-content-center mt-4">
                    <div className="d-flex flex-column w-50">
                        { errorBlocks }
                    </div>
                </div>
                <div className="d-flex justify-content-center">
                    <form className="w-50 mt-4 mb-3 d-flex flex-column comment-form" method="post" onSubmit={ this.onSubmit }>
                        <div className="d-flex flex-column justify-content-center">
                            <div>
                            { this.state.expanded ?
                                <div className="emoji-panel">
                                    <Picker onEmojiClick={ this.onEmojiClick } />
                                </div>
                            :
                                <div></div>
                            }
                            </div>
                        </div>   
                        { this.state.expanded ?
                            <div className="d-flex justify-content-between self-align h-100">
                                <div className="d-flex flex-column justify-content-center">
                                    <div onClick={ () => this.setState({ expanded: !this.state.expanded }) } className="pointer">
                                        <img src={ require("../../../img/emoji.png") } alt="Emoji" width="30px" height="30px" />
                                    </div> 
                                </div>         
                                <textarea name="content" value={ this.state.content } onChange= { this.onChangeContent } placeholder="Input your thoughts here..." rows="3" className="py-3 px-4 border-0"></textarea>
                                <div className="d-flex flex-column justify-content-center">
                                    <div onClick={ this.onSubmit } className="pointer">
                                        <img src={ require("../../../img/send.png") } alt="Send" width="40px" height="40px" />
                                    </div>
                                </div>
                            </div> 
                        :
                            <div className="d-flex justify-content-between h-100">
                                <div className="d-flex flex-column justify-content-center">
                                    <div onClick={ () => this.setState({ expanded: !this.state.expanded }) } className="pointer">
                                        <img src={ require("../../../img/emoji.png") } alt="Emoji" width="30px" height="30px" />
                                    </div> 
                                </div>         
                                <textarea name="content" value={ this.state.content } onChange= { this.onChangeContent } placeholder="Input your thoughts here..." rows="3" className="py-3 px-4 border-0"></textarea>
                                <div className="d-flex flex-column justify-content-center">
                                    <div onClick={ this.onSubmit } className="pointer">
                                        <img src={ require("../../../img/send.png") } alt="Send" width="40px" height="40px" />
                                    </div>
                                </div>
                            </div> 
                        }
                    </form>
                </div>
            </div>

        );

    }

}

export default AddCommentForm;
