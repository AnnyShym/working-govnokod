import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import axios from 'axios';

import Comment from './Comment';
import AddCommentForm from './AddCommentForm';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/comment.css';

class CommentsBlock extends Component {

    constructor(props) {

        super(props);

        this.state = {
            comments: null,
            userId: null,
            allowed: true,
            errors: []
        };

        this.socket = socketIOClient(serverAddress);

    }

    componentDidMount() {
        this.getComments();
        this.getNewComment();
    }

    getComments() {
        axios.get(`${serverAddress}comments/${this.props.about}/${this.props.id}`,
            {withCredentials: true})
        .then(response => {          
            this.setState({
                comments: response.data.rows,
                userId: response.data.userId,
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
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    errors: err.response.data.errors
                });
            } 
        })
    }

    getNewComment() {
        this.socket.on('get new comment', (res) => {
            if (res.statusCode === statusCodes.OK) {
                this.setState({
                    comments : [ res.rows[0], ...this.state.comments ]
                });
            }
            else {
                console.log(`${res.statusCode}: ${res.errors}`);
                this.setState({
                    errors: res.errors
                });
            }
        })
    }

    render() {

        if (this.state.comments === null) {
            return null;
        }

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }

        return(

            <div className="d-flex flex-column p-4 bg-white">
                <div className="d-flex pb-3 mb-3 header">
                    <div>
                        <img src={ require("../../../img/comments.png") } alt="Comments" width="30px" height="30px" />
                    </div>
                    <div className="ml-2 d-flex flex-column justify-content-center font-weight-bold">
                        Comments ({ this.state.comments.length })
                    </div>
                </div>
                <AddCommentForm about={ this.props.about } id={ this.props.id } />
                <div className="d-flex justify-content-center">
                    <div className="d-flex flex-column w-50">
                        { 
                            this.state.comments.map((comment, index) => 
                                <Comment key={ index } comment={ comment } userId={ this.state.userId } />
                            )
                        }
                    </div>
                </div>
            </div>

        );

    }

}

export default CommentsBlock;
