import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';

import serverAddress from '../../modules/server';
import statusCodes from '../../modules/status_codes';

import '../../styles/search.css';

class SearchArticles extends Component {

    constructor(props) {

        super(props);

        this.state = {
            criteria: {
                title: "",
                series: [],
                filter: { label: "newness", value: { column: "publication-date", direction: "desc" } }
            },
            series: null,
            expanded: false,
            allowed: true,
            errors: [],
        }

    }

    componentDidMount() {
        this.search();
    }

    onExpand = () => {

        if (!this.state.expanded) {
            if (this.state.series === null) {
                this.getSeries();
            }
        }

        this.setState({
            expanded: !this.state.expanded
        });

    }

    getSeries = () => {
        axios.get(`${serverAddress}series`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                series: response.data.rows,
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

    search = () => {

        let criteria = Object.assign({}, this.state.criteria);

        criteria.title = criteria.title.trim();
        if (criteria.title === '') {
            criteria.title = ' ';
        }

        if (!criteria.series || (criteria.series.length === 0)) {
            criteria.series = " ";
        }
        else {
            let seriesArr = [];
            criteria.series.map((series) =>
                seriesArr.push(series.value)
            );
            criteria.series = seriesArr.join('&');
        }

        criteria.filter = criteria.filter.value;

        this.props.onFormRequest(criteria);

    }

    onChangeTitle = (e) => {
        this.setState({
            criteria: {
                ...this.state.criteria,
                title: e.target.value
            }
        });
    }

    onChangeFilter = (selected) => {
        this.setState({
            criteria: {
                ...this.state.criteria,
                filter: selected
            }
        });
    }

    onChangeSeries = (selected) => {
        this.setState({
            criteria: {
                ...this.state.criteria,
                series: selected
            }
        });
    }

    onSubmit = (e) => {

        e.preventDefault();

        this.setState({
            expanded: false
        });

        this.search();

    }

    render() {

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }

        let isReady = null;
        let seriesOptions = null;
        let filterOptions = null;
        let styles = null;
        let themeConfig = null;
        if (this.state.expanded) {

            if (this.state.series === null) {
                isReady = false;
            }
            else {

                isReady = true;

                seriesOptions = [];
                this.state.series.map((series) =>
                    seriesOptions.push({ label: series.title, value: series.series_id })
                );

                filterOptions = [
                    { label: "newness", value: { column: "publication-date", direction: "desc" } },
                    { label: "title ↑", value: { column: "title", direction: "asc" } },
                    { label: "title ↓", value: { column: "title", direction: "desc" } },
                ];

                styles = {
                    option: (provided, state) => ({
                        ...provided,
                        height: 40
                    })
                };

                themeConfig = (theme) => ({
                    ...theme,
                    colors: {
                        ...theme.colors,
                        primary: '#C47A7B',
                        primary25: '#E3D5DA',
                        primary50: '#EAD5DA',
                        neutral10: "#EAD5DA",
                    }
                });

            }

        }

        return(

            <div className="w-100 d-flex justify-content-center mt-3">
                <div className="search">
                    <form className="w-100" method="post" onSubmit={ this.onSubmit }>
                        <div className="w-100 d-flex flex-column">
                            <div className="w-100 form-group d-flex">
                                <input type="text" name="title" value={ this.state.criteria.title } onChange= { this.onChangeTitle } id="exampleFormControlInput1" className="mr-3 d-block border-0 py-0 px-4 w-100" />
                                <div className="d-flex flex-column justify-content-center">
                                    <div>
                                        { this.state.expanded ?
                                            <img src={ require("../../img/hide.png") } alt="Hide" height="25px" onClick={ this.onExpand } className="pointer" />
                                        :
                                            <img src={ require("../../img/expand.png") } alt="Expand" height="25px" onClick={ this.onExpand } className="pointer" />
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        { (this.state.expanded && isReady) ?
                            <div className="expanded bg-white p-5 shadow">
                                <div className="d-flex justify-content-between w-100">
                                    <div className="w-75">
                                        <div className="d-flex justify-content-between w-100">
                                            <div className="form-group d-flex flex-column width-74">
                                                <label>Series:</label>
                                                <Select isMulti options={ seriesOptions } value={ this.state.criteria.series } onChange={ this.onChangeSeries } placeholder="" styles={ styles } theme={ themeConfig } />
                                            </div>
                                            <div className="form-group d-flex flex-column width-24">
                                                <label>Filter By:</label>
                                                <Select options={ filterOptions } value={ this.state.criteria.filter } onChange={ this.onChangeFilter } placeholder="" theme={ themeConfig } />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group d-flex flex-column justify-content-center w-25 mb-0">
                                        <div onClick={ this.onSubmit } className="d-flex justify-content-center">
                                            <img src={ require("../../img/search.png") } width="50px" height="50px" alt="Search" className="pointer mt-3 ml-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        :
                            <div></div>
                        }
                    </form>
                </div>
            </div>

        );

    }

}

export default SearchArticles;
