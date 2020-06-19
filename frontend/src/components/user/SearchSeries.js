import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';

import serverAddress from '../../modules/server';
import statusCodes from '../../modules/status_codes';

import '../../styles/search.css';

class SearchSeries extends Component {

    constructor(props) {

        super(props);

        this.state = {
            criteria: {
                title: "",
                country: null,
                englishLevel: null,
                ageLimit: null,
                tags: [],
                genres: [],
                actors: [],
                creators: [],
                producers: [],
                filter: { label: "popularity", value: { column: "rating", direction: "desc" } }            
            },
            countries: null,
            englishLevels: null,
            ageLimits: null,
            tags: null,
            genres: null,
            actors: null,
            creators: null,
            producers: null,
            expanded: false,
            allowed: true,
            errors: [],
        }

    }

    componentDidMount() {

        if (this.props.criteria !== undefined) {

            let tags = [];
            let genres = [];

            if (this.props.criteria === "tags") {
                tags.push({ value: this.props.id });
            }

            if (this.props.criteria === "genres") {
                genres.push({ value: this.props.id });
            }

            this.setState({
                criteria: {
                    ...this.state.criteria,
                    tags: tags,
                    genres: genres,
                }
            });

        }

        setTimeout(() => this.search());      

    }

    onExpand = () => {

        if (!this.state.expanded) {

            if (this.state.countries === null) {
                this.getCountries(); 
            }

            if (this.state.englishLevels === null) {
                this.getEnglishLevels(); 
            }

            if (this.state.ageLimits === null) {
                this.getAgeLimits();
            }

            if (this.state.tags === null) {
                this.getTags();
            }

            if (this.state.genres === null) {
                this.getGenres(); 
            }

            if (this.state.actors === null) {
                this.getActors();
            }

            if (this.state.creators === null) {
                this.getCreators();
            }                                    
            
            if (this.state.producers === null) {
                this.getProducers();
            }         
   
        }

        this.setState({ 
            expanded: !this.state.expanded 
        });

    }

    getCountries = () => {
        axios.get(`${serverAddress}countries`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                countries: response.data.rows,
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

    getAgeLimits = () => {
        axios.get(`${serverAddress}age-limits`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                ageLimits: response.data.rows,
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

    getEnglishLevels = () => {
        axios.get(`${serverAddress}english-levels`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                englishLevels: response.data.rows,
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

    getTags = () => {
        axios.get(`${serverAddress}tags`,
            {withCredentials: true})
        .then(response => {
            let tags = this.state.criteria.tags;
            if (tags.length > 0) {
                response.data.rows.map((tag) => {
                    if (tags[0].value = tag.value) {
                        tags[0] = { label: tag.name, value: tag.tag_id };
                    }
                });
            }
            this.setState({
                criteria: {
                    ...this.state.criteria,
                    tags: tags
                },
                tags: response.data.rows,
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

    getGenres = () => {
        console.log(this.state.criteria.genres);
        axios.get(`${serverAddress}genres`,
            {withCredentials: true})
        .then(response => {

            let genres = this.state.criteria.genres;
            if (genres.length > 0) {
                response.data.rows.map((genre) => {
                    if (genres[0].value = genre.value) {
                        genres[0] = { label: genre.name, value: genre.genre_id };
                    }
                });
            }

            this.setState({
                criteria: {
                    ...this.state.criteria,
                    genres: genres
                },
                genres: response.data.rows,
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

    getActors = () => {
        axios.get(`${serverAddress}actors`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                actors: response.data.rows,
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

    getCreators = () => {
        axios.get(`${serverAddress}creators`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                creators: response.data.rows,
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

    getProducers = () => {
        axios.get(`${serverAddress}producers`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                producers: response.data.rows,
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

        if (criteria.country && criteria.country.value) {            
            criteria.country = criteria.country.value;   
        }
        else {
            criteria.country = " "; 
        }

        if (criteria.englishLevel && criteria.englishLevel.value) {            
            criteria.englishLevel = criteria.englishLevel.value;   
        }
        else {
            criteria.englishLevel = " "; 
        }

        if (criteria.ageLimit && criteria.ageLimit.value) {            
            criteria.ageLimit = criteria.ageLimit.value;   
        }
        else {
            criteria.ageLimit = " "; 
        }

        if (!criteria.tags || (criteria.tags.length === 0)) {
            criteria.tags = " ";            
        }
        else {
            let tags = [];
            criteria.tags.map((tag) =>
                tags.push(tag.value)
            );
            criteria.tags = tags.join('&');
        }

        if (!criteria.genres || (criteria.genres.length === 0)) {
            criteria.genres = " ";            
        }
        else {
            let genres = [];
            criteria.genres.map((genre) =>
                genres.push(genre.value)
            );
            criteria.genres = genres.join('&');
        }

        if (!criteria.actors || (criteria.actors.length === 0)) {
            criteria.actors = " ";            
        }
        else {
            let actors = [];
            criteria.actors.map((actor) =>
                actors.push(actor.value)
            );
            criteria.actors = actors.join('&');
        }

        if (!criteria.creators || (criteria.creators.length === 0)) {
            criteria.creators = " ";            
        }
        else {
            let creators = [];
            criteria.creators.map((creator) =>
                creators.push(creator.value)
            );
            criteria.creators = creators.join('&');
        }

        if (!criteria.producers || (criteria.producers.length === 0)) {
            criteria.producers = " ";            
        }
        else {
            let producers = [];
            criteria.producers.map((producer) =>
                producers.push(producer.value)
            );
            criteria.producers = producers.join('&');
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

    onChangeCountry = (selected) => {
        this.setState({
            criteria: {
                ...this.state.criteria,
                country: selected
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

    onChangeEnglishLevel = (selected) => {
        this.setState({
            criteria: {
                ...this.state.criteria,
                englishLevel: selected
            }
        });
    }

    onChangeAgeLimit = (selected) => {
        this.setState({
            criteria: {
                ...this.state.criteria,
                ageLimit: selected
            }
        });
    }

    onChangeGenres = (selected) => {
        this.setState({
            criteria: {
                ...this.state.criteria,
                genres: selected
            }
        });
    }

    onChangeTags = (selected) => {
        this.setState({
            criteria: {
                ...this.state.criteria,
                tags: selected
            }
        });
    }

    onChangeActors = (selected) => {
        this.setState({
            criteria: {
                ...this.state.criteria,
                actors: selected
            }
        });
    }

    onChangeCreators = (selected) => {
        this.setState({
            criteria: {
                ...this.state.criteria,
                creators: selected
            }
        });
    }

    onChangeProducers = (selected) => {
        this.setState({
            criteria: {
                ...this.state.criteria,
                producers: selected
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
        let countryOptions = null;
        let levelOptions = null;
        let limitOptions = null;
        let tagOptions = null;
        let genreOptions = null;
        let actorOptions = null;
        let creatorOptions = null;
        let producerOptions = null;
        let filterOptions = null;
        let styles = null;
        let themeConfig = null;
        if (this.state.expanded) {

            if (this.state.countries === null ||
                this.state.ageLimits === null || 
                this.state.englishLevels === null ||
                this.state.tags === null ||
                this.state.genres === null ||
                this.state.actors === null ||
                this.state.creators === null ||
                this.state.producers === null) {
                isReady = false;
            }
            else {

                isReady = true;

                countryOptions = [{ label: " ", value: null }];
                this.state.countries.map((country) =>
                    countryOptions.push({ label: country.name, value: country.country_id })
                );

                levelOptions = [{ label: " ", value: null }];
                this.state.englishLevels.map((englishLevel) =>
                    levelOptions.push({ label: englishLevel.english_level, value: englishLevel.english_level_id })
                );

                limitOptions = [{ label: " ", value: null }];
                this.state.ageLimits.map((ageLimit) =>
                    limitOptions.push({ label: ageLimit.age_limit, value: ageLimit.age_limit_id })
                );

                tagOptions = [];
                this.state.tags.map((tag) =>
                    tagOptions.push({ label: tag.name, value: tag.tag_id })
                );

                genreOptions = [];
                this.state.genres.map((genre) =>
                    genreOptions.push({ label: genre.name, value: genre.genre_id })
                );

                actorOptions = [];
                this.state.actors.map((actor) =>
                    actorOptions.push({ label: `${actor.name} ${(actor.middle_name === null) ? "" : `${
                        actor.middle_name} `}${actor.surname}${(actor.pseudonym === null) ? "" : ` (${actor.pseudonym})`}`, 
                        value: actor.actor_id })
                );

                creatorOptions = [];
                this.state.creators.map((creator) =>
                    creatorOptions.push({ label: `${creator.name} ${(creator.middle_name === null) ? "" : `${
                        creator.middle_name} `}${creator.surname}${(creator.pseudonym === null) ? "" : ` (${creator.pseudonym})`}`, 
                        value: creator.creator_id })
                );

                producerOptions = [];
                this.state.producers.map((producer) =>
                    producerOptions.push({ label: `${producer.name} ${(producer.middle_name === null) ? "" : `${
                        producer.middle_name} `}${producer.surname}${(producer.pseudonym === null) ? "" : ` (${producer.pseudonym})`}`, 
                        value: producer.producer_id })
                );

                filterOptions = [
                    { label: "popularity", value: { column: "rating", direction: "desc" } },
                    { label: "newness", value: { column: "premiere-date", direction: "desc" } },
                    { label: "title ↑", value: { column: "title", direction: "asc" } },
                    { label: "title ↓", value: { column: "title", direction: "desc" } },
                    { label: "complexity", value: { column: "english-level-id", direction: "desc" } },
                    { label: "simplicity", value: { column: "english-level-id", direction: "asc" } },
                    { label: "age ↑", value: { column: "age-limit-id", direction: "asc" } },
                    { label: "age ↓", value: { column: "age-limit-id", direction: "desc" } },
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
                                <div className="d-flex flex-column">
                                    <div className="d-flex justify-content-between w-100">
                                        <div className="d-flex flex-column w-75">
                                            <div className="d-flex justify-content-between w-100">
                                                <div className="form-group d-flex flex-column width-66">
                                                    <label>Country:</label> 
                                                    <Select options={ countryOptions } value={ this.state.criteria.country } onChange={ this.onChangeCountry } placeholder="" styles={ styles } theme={ themeConfig } />
                                                </div>
                                                <div className="form-group d-flex flex-column width-32">
                                                    <label>Filter By:</label> 
                                                    <Select options={ filterOptions } value={ this.state.criteria.filter } onChange={ this.onChangeFilter } placeholder="" theme={ themeConfig } />
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between w-100">
                                                <div className="form-group d-flex flex-column width-74">
                                                    <label>English Level:</label>
                                                    <Select options={ levelOptions } value={ this.state.criteria.englishLevel } onChange={ this.onChangeEnglishLevel } placeholder="" styles={ styles } theme={ themeConfig } />
                                                </div>
                                                <div className="form-group d-flex flex-column width-24">
                                                    <label>Age Limit:</label>
                                                    <Select options={ limitOptions } value={ this.state.criteria.ageLimit } onChange={ this.onChangeAgeLimit } placeholder="" styles={ styles } theme={ themeConfig } />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group d-flex flex-column justify-content-center w-25 mb-0">
                                            <div onClick={ this.onSubmit } className="d-flex justify-content-center">
                                                <img src={ require("../../img/search.png") } width="30%" alt="Search" className="pointer" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div className="form-group d-flex flex-column width-49">
                                            <label>Genres:</label>
                                            <Select isMulti options={ genreOptions } value={ this.state.criteria.genres } onChange={ this.onChangeGenres } placeholder="" theme={ themeConfig } />
                                        </div>
                                        <div className="form-group d-flex flex-column width-49">
                                            <label>Tags:</label>
                                            <Select isMulti options={ tagOptions } value={ this.state.criteria.tags } onChange={ this.onChangeTags } placeholder="" theme={ themeConfig } />
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div className="form-group d-flex flex-column width-32">
                                            <label>Actors:</label>
                                            <Select isMulti options={ actorOptions } value={ this.state.criteria.actors } onChange={ this.onChangeActors } placeholder="" theme={ themeConfig } />
                                        </div>
                                        <div className="form-group d-flex flex-column width-32">
                                            <label>Creators:</label>
                                            <Select isMulti options={ creatorOptions } value={ this.state.criteria.creators } onChange={ this.onChangeCreators } placeholder="" theme={ themeConfig } />
                                        </div>
                                        <div className="form-group d-flex flex-column width-32">
                                            <label>Producers:</label>
                                            <Select isMulti options={ producerOptions } value={ this.state.criteria.producers } onChange={ this.onChangeProducers } placeholder="" theme={ themeConfig } />
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

export default SearchSeries;