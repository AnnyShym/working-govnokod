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
        this.getDeletedComment();
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
                if (res.about === this.props.about && res.rows[0].about_id === this.props.id) {
                    this.setState({
                        comments : [ res.rows[0], ...this.state.comments ]
                    });
                }
            }
            else {
                console.log(`${res.statusCode}: ${res.errors}`);
                this.setState({
                    errors: res.errors
                });
            }
        })
    }

    getDeletedComment() {
        this.socket.on('get deleted comment', (res) => {
            if (res.statusCode === statusCodes.OK) {
                if (res.about === this.props.about && res.rows[0].about_id === this.props.id) {
                    let comments = this.state.comments;
                    for (let i = 0; i < comments.length; i++) {
                        if (comments[i].comment_id === res.rows[0].comment_id) {
                            comments.splice(i, 1);
                            break;
                        }
                    }
                    this.setState({
                        comments : comments
                    });
                }
            }
            else {
                console.log(`${res.statusCode}: ${res.errors}`);
                this.setState({
                    errors: res.errors
                });
            }
        })
    }

    handleDeleteComment = (commentId) => {

        const token = document.cookie.replace(/(?:(?:^|.*;\s*)user_auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");

        this.socket.emit('delete comment', this.props.about, this.props.id, commentId, token);
        this.socket.on('delete comment', (res) => {
            if (res.statusCode !== statusCodes.NO_CONTENT) {
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
                    allowed: true,
                    errors: []
                });                
            }
        });

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
                                <Comment key={ index } comment={ comment } userId={ this.state.userId } onDeleteComment={ this.handleDeleteComment} />
                            )
                        }
                    </div>
                </div>
            </div>

        );

    }

}

export default CommentsBlock;
