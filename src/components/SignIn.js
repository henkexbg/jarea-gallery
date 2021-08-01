import React, { Component } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

class SignIn extends Component {

    constructor(props) {
        super(props);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleLoginInternal = this.handleLoginInternal.bind(this);
        this.handleFailedLogin = this.handleFailedLogin.bind(this);
        this.handleLogin = props.handleLogin;
        this.state = { failedLogin: false, username: '', password: '' };
    }

    handleUsernameChange(event) {
        this.setState({ username: event.target.value });
    }

    handlePasswordChange(event) {
        this.setState({ password: event.target.value });
    }

    handleLoginInternal(e) {
        e.preventDefault();
        this.handleLogin(this.state.username, this.state.password, this.handleFailedLogin);
    }

    handleFailedLogin() {
        this.setState({ failedLogin: true });
    }

    render() {
        return (
            <Container component='main' maxWidth='xs'>
                <CssBaseline />
                <div className='login-div'>
                    <Avatar>
                        <LockOutlinedIcon />
                    </Avatar>
                    {this.state.failedLogin ?
                        <Typography component='h1' variant='h5' className='login-header-failed'>
                            Login failed!
                        </Typography>
                        :
                        <Typography component='h1' variant='h5' className='login-header'>
                            Sign in
                        </Typography>
                    }
                    <form className='login-form' noValidate onSubmit={this.handleLoginInternal}>
                        <TextField
                            variant='outlined'
                            margin='normal'
                            required
                            fullWidth
                            id='username'
                            label='Username'
                            name='username'
                            autoComplete='username'
                            autoFocus
                            onChange={this.handleUsernameChange}
                            value={this.state.username}
                        />
                        <TextField
                            variant='outlined'
                            margin='normal'
                            required
                            fullWidth
                            name='password'
                            label='Password'
                            type='password'
                            id='password'
                            autoComplete='current-password'
                            onChange={this.handlePasswordChange}
                            value={this.state.password}
                        />
                        <Button
                            type='submit'
                            fullWidth
                            variant='contained'
                            color='primary'
                        >
                            Sign In
                        </Button>
                    </form>
                </div>
            </Container>
        );
    }
}

export default SignIn;
