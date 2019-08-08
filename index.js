/**
 * @format
 */
import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import {Provider} from 'mobx-react';
import {chats, users} from './src/stores'

class MessagingApp extends React.Component {
    render() {
        return (
            <Provider users={users} chats={chats}>
                <App/>
            </Provider>
        );
    }
}

AppRegistry.registerComponent(appName, () => MessagingApp);
