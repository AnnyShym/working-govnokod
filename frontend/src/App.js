import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
import AllSeries from './components/user/allseries/AllSeries';
import AllArticles from './components/user/articles/AllArticles';
import SeriesPage from './components/user/seriespage/SeriesPage';
import ArticlePage from './components/user/articles/ArticlePage';
import Episode from './components/user/episodes/Episode';
import PlayGroundPage from './components/user/training/PlayGroundPage';
import Training from './components/user/training/Training';
import AccountPage from './components/user/account/AccountPage';
import CastPage from './components/user/cast/CastPage';

import AllTables from './components/admin/AllTables';
import Actors from './components/admin/actors/Actors';
import DeleteActor from './components/admin/actors/DeleteActor';
import ChangeActor from './components/admin/actors/ChangeActor';
import Series from './components/admin/series/Series';
import DeleteSeries from './components/admin/series/DeleteSeries';
import ChangeSeries from './components/admin/series/ChangeSeries';
import Users from './components/admin/users/Users';
import DeleteUser from './components/admin/users/DeleteUser';
import ChangeUser from './components/admin/users/ChangeUser';
import ActorsInSeries from './components/admin/actorsinseries/ActorsInSeries';
import DeleteActorsInSeries from './components/admin/actorsinseries/DeleteActorsInSeries';
import ChangeActorsInSeries from './components/admin/actorsinseries/ChangeActorsInSeries';

class App extends Component {
    render() {
        return(

            <Router>
                <Switch>

                    <Route exact path='/' component={ AllArticles }/>
                    <Route exact path='/signup' component={ SignUp }/>
                    <Route exact path='/signin' component={ SignIn }/>
                    <Route exact path='/series/:seriesId/seasons/:seasonNumber/episodes/:episodeNumber' component={ Episode }/>
                    <Route exact path='/series/:criteria/:id' component={ AllSeries }/>
                    <Route exact path='/series/:id' component={ SeriesPage }/>
                    <Route exact path='/series' component={ AllSeries }/>
                    <Route exact path='/articles/:id' component={ ArticlePage }/>
                    <Route exact path='/articles' component={ AllArticles }/>
                    <Route exact path='/play-ground' component={ PlayGroundPage }/>
                    <Route exact path='/training/:kind' component={ Training }/>
                    <Route exact path='/account' component={ AccountPage }/>
                    <Route exact path='/:cast/:id' component={ CastPage }/>

                    <Route exact path='/tables' component={ AllTables }/>
                    <Route exact path='/tables/actors/delete/:id' component={ DeleteActor } />
                    <Route exact path='/tables/actors/:operation/:id' component={ ChangeActor } />
                    <Route exact path='/tables/actors/:operation' component={ ChangeActor } />
                    <Route exact path='/tables/series/delete/:id' component={ DeleteSeries } />
                    <Route exact path='/tables/series/:operation/:id' component={ ChangeSeries} />
                    <Route exact path='/tables/series/:operation' component={ ChangeSeries } />
                    <Route exact path='/tables/users/delete/:id' component={ DeleteUser } />
                    <Route exact path='/tables/users/:operation/:id' component={ ChangeUser} />
                    <Route exact path='/tables/users/:operation' component={ ChangeUser } />
                    <Route exact path='/tables/actorsinseries/delete/:id' component={ DeleteActorsInSeries} />
                    <Route exact path='/tables/actorsinseries/:operation/:id' component={ ChangeActorsInSeries} />
                    <Route exact path='/tables/actorsinseries/:operation' component={ ChangeActorsInSeries } />
                    <Route exact path='/tables/actors' component={ Actors } />
                    <Route exact path='/tables/series' component={ Series } />
                    <Route exact path='/tables/users' component={ Users } />
                    <Route exact path='/tables/actorsinseries' component={ ActorsInSeries } />

                </Switch>
            </Router>

        );
    }
}

export default App;
