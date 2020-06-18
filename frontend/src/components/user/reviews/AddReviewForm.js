import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import socketIOClient from 'socket.io-client';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/comment.css';

const MAX_LENGTH = 10000;
const LENGTH_MSG = "You have exceeded the allowed number of characters!";

class AddReviewForm extends Component {

    constructor(props) {

        super(props);

        this.state = {
            content: "",
            allowed: true,
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

            this.socket.emit('add review', this.props.seriesId, 
                content, token);
            this.socket.on('add review', (res) => {
                if (res.statusCode !== statusCodes.CREATED) {
                    console.log(`${res.statusCode}: ${res.errors}`);
                    if (res.statusCode === statusCodes.UNAUTHORIZED) {
                        this.setState({
                            allowed: false,
                            errors: res.errors
                        });
                    }
                    if (res.statusCode === statusCodes.INTERNAL_SERVER_ERROR ||
                        res.statusCode === statusCodes.BAD_REQUEST) {
                        this.setState({
                            errors: res.errors
                        });
                    }
                }
                else {
                    this.setState({
                        content: "",
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
                    <form className="w-50 mt-4 mb-3 d-flex justify-content-between form" method="post" onSubmit={ this.onSubmit }>
                        <div className="d-flex flex-column justify-content-center">
                            <div onClick={ () => this.setState({ content: `${this.state.content}<i></i>` }) } className="pointer mb-2 mx-2">
                                <img src={ require("../../../img/italic.png") } alt="Make Italic" width="20px" height="20px" />
                            </div>
                            <div onClick={ () => this.setState({ content: `${this.state.content}<b></b>` }) } className="pointer mb-2 mx-2">
                                <img src={ require("../../../img/bold.png") } alt="Make Bold" width="20px" height="20px" />
                            </div>
                            <div onClick={ () => this.setState({ content: `${this.state.content}<u></u>` }) } className="pointer mb-2 mx-2">
                                <img src={ require("../../../img/underline.png") } alt="Underline" width="20px" height="20px" />
                            </div>
                            <div onClick={ () => this.setState({ content: `${this.state.content}<s></s>` }) } className="pointer mx-2">
                                <img src={ require("../../../img/strikethrough.png") } alt="Strike Through" width="20px" height="20px" />
                            </div>
                        </div>              
                        <textarea name="content" value={ this.state.content } onChange= { this.onChangeContent } placeholder="Write your review in here..." rows="7" className="py-3 px-4 border-0"></textarea>
                        <div className="d-flex flex-column justify-content-center">
                            <div onClick={ this.onSubmit } className="pointer">
                                <img src={ require("../../../img/publish.png") } alt="Publish" width="40px" height="40px" />
                            </div>
                        </div>
                    </form>
                </div>
            </div>

        );

    }

}

export default AddReviewForm;
