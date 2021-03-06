import React, { Component } from 'react';
import { Sidebar, Segment, Menu, Header, Icon, List, Popup, Progress, Loader } from 'semantic-ui-react'

import 'semantic-ui-css/semantic.min.css';
import '../assets/css/App.css';

const DONATE_ADDR = 'IQJGHISHRMV9LEAEMSUIXMFTLLZIJWXIQOAZLGNXCFY9BLPTFTBNBPGU9YQFQKC9GEBPNNFO9DMGKYUECCG9ZSHMRW';

class App extends Component {
    constructor(params) {
        super(params);
        this.state = {};
        window.ipcRenderer.on('state', (event, state) => {
            console.log('STATE', state);
            this.setState(state);
        });
    }

    render() {
        const {
            iri = { status: 'waiting' },
            nelson = { status: 'waiting' },
            database = { status: 'waiting' },
            system = { status: 'waiting' }
        } = this.state;
        const copyAddress = () => {
            this.copied = true;
            this.setState({ copied: {} });
            window.clipboard.writeText(DONATE_ADDR);
            window.clipboard.writeText(DONATE_ADDR, 'selection');
            console.log('DONATE_ADDR', DONATE_ADDR);
            console.log('CLIP', clipboard.readText('selection'));
            console.log('CLIP2', clipboard.readText());
        };

        return (
            <Sidebar.Pushable as={Segment} className='wrapper'>
                <Sidebar as={Menu} animation='overlay' direction='bottom' visible={true} inverted>
                    <StatusIcon component='System' state={system} />
                    <StatusIcon component='Database' state={database} />
                    <StatusIcon component='IRI' state={iri} />
                    <StatusIcon component='Nelson' state={nelson} />
                    <Popup trigger={
                        <Menu.Item name='donate' color='red' onClick={copyAddress}>
                            <Icon name='heart' color='red' /> Donate
                        </Menu.Item>
                    } content={this.copied ? 'Copied! (click to copy again)' : 'Click to copy address'} wide />
                </Sidebar>
                <Sidebar.Pusher>
                    <StateView state={this.state} />
                </Sidebar.Pusher>
            </Sidebar.Pushable>
        );
    }
}

function StatusIcon ({ component, state }) {
    let icon = 'clock';
    let color = 'grey';
    let popup = state.status;
    switch (state.status) {
        case 'checking':
            icon = 'search';
            color = 'teal';
            break;
        case 'downloading':
            icon = 'download';
            color = 'orange';
            popup = `${state.status}: ${(state.progress.percent * 100).toFixed(2)}%`;
            break;
        case 'ready':
            icon = 'checkmark';
            color = 'olive';
            break;
        case 'starting':
            icon = 'send';
            color = 'yellow';
            break;
        case 'running':
            icon = 'play';
            color = 'green';
            break;
        case 'error':
            icon = 'frown';
            color = 'red';
            popup = `${state.status}: ${state.error}`;
            break;
        case 'stopped':
            icon = 'stop';
            color = 'grey';
            break;
        default:
            icon = 'clock';
            color = 'grey';
    }
    const item = (
        <Menu.Item name={component} color={color}>
            <Icon name={icon} color={color} />
            {component}
        </Menu.Item>
    );

    return (
        <Popup trigger={item} content={popup} wide />
    )
}

function StateView ({ state }) {
    if (state.iri && state.nelson && state.nelson.status !== 'running' && state.iri.status !== 'running' && Object.values(state).filter(s => s.status === 'error').length > 0) {
        return <ErrorView state={state} />
    }
    if (Object.values(state).filter(s => ['checking', 'downloading', 'waiting'].includes(s.status)).length) {
        return <LoadingView state={state} />
    }

    if (!state.iri) {
        return <div>&nbsp;</div>
    }

    const localAddress = 'http://localhost:14265';

    const isIRISyncronized = state.iri.status === 'running' &&
        state.iri.info.latestSolidSubtangleMilestoneIndex > 243000 &&
        state.iri.info.latestSolidSubtangleMilestoneIndex === state.iri.info.latestMilestoneIndex;
    const iriMilestones = state.iri.status === 'running'
        ? `(${state.iri.info.latestSolidSubtangleMilestoneIndex}/${state.iri.info.latestMilestoneIndex})`
        : '';


    return (
        <Segment basic>
            <Segment basic textAlign='center'>
                <Header as='h2' icon color='green'>
                    <Icon name='lab' />
                    CarrIOTA Bolero
                    <Header.Subheader>
                        Spreading IOTA Nodes like wildfire!
                    </Header.Subheader>
                </Header>
            </Segment>
            <List divided relaxed>
                <List.Item>
                    <List.Icon name='heartbeat' size='large' verticalAlign='middle' />
                    <List.Content>
                        <List.Header>IRI Status</List.Header>
                        <List.Description>{state.iri.status === 'running' ? 'Running' : 'Not running'}</List.Description>
                    </List.Content>
                </List.Item>
                <List.Item>
                    <List.Icon name='wifi' size='large' verticalAlign='middle' />
                    <List.Content>
                        <List.Header>IRI Synchronized?</List.Header>
                        <List.Description>{isIRISyncronized ? 'Yes' : 'No'}&nbsp;{iriMilestones}</List.Description>
                    </List.Content>
                </List.Item>
                <List.Item>
                    <List.Icon name='sitemap' size='large' verticalAlign='middle' />
                    <List.Content>
                        <List.Header>IRI Neighbors</List.Header>
                        <List.Description>{state.iri.status === 'running' ? state.iri.info.neighbors : 0}</List.Description>
                    </List.Content>
                </List.Item>
                <List.Item>
                    <List.Icon name='heartbeat' size='large' verticalAlign='middle' />
                    <List.Content>
                        <List.Header>Nelson Status</List.Header>
                        <List.Description>{state.nelson.status === 'running' ? 'Running' : 'Not running'}</List.Description>
                    </List.Content>
                </List.Item>
                <List.Item>
                    <List.Icon name='heartbeat' size='large' verticalAlign='middle' />
                    <List.Content>
                        <List.Header>Full Node URL (for your wallet; click to copy)</List.Header>
                        <List.Description as='a' onClick={() => {
                            window.clipboard.writeText(localAddress);
                            window.clipboard.writeText(localAddress, 'selection');
                        }}>{state.iri.status === 'running' ? localAddress : '...'}</List.Description>
                    </List.Content>
                </List.Item>
            </List>
        </Segment>
    )
}

function LoadingView({ state }) {
    const showLoading = Object.values(state).filter(s => s.status === 'downloading').length > 0;
    const progress = showLoading
        ? Object.values(state).reduce((t, s) => (
            s.status === 'downloading' ? {
                total: t.total + s.progress.size.total,
                transferred: t.transferred + s.progress.size.transferred
            } : t
        ), { total: 0, transferred: 0 })
        : null;
    const progressElement = showLoading
        ? <Progress percent={(parseFloat(progress.transferred) / progress.total * 100).toFixed(2)} indicating />
        : null;
    return (
        <Segment basic className='loadview' textAlign='center'>
            <Header as='h2' icon>
                <Loader size='huge' active inline='centered' className='mainloader' />
                Checking system and downloading content
                <Header.Subheader>
                    It only happens once, but might take a while. <br/>
                    Meanwhile, make sure that your router has <br/>
                    <b>15600 and 16600 TCP</b> ports open and forwarded <br/>
                    as well as <b>14600 UDP</b>.
                </Header.Subheader>
            </Header>
            {progressElement}
        </Segment>
    )
}

function ErrorView({ state }) {
    return (
        <Segment basic className='loadview' textAlign='center'>
            <Header as='h2' icon>
                <Icon name='frown' color='red' />
                Well, that's a bummer!
                <Header.Subheader>
                    Something went wrong. Please hover over the component buttons below for more info!
                </Header.Subheader>
            </Header>
        </Segment>
    )
}

export default App;
