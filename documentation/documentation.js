import express from 'express';

const documentation = express.Router();

documentation.get('/', (req, res) => {
  const data = {
    user: {
      registerUser: {
        Endpoint: '/api/user/register',
        Method: 'POST',
        Request: {
          Body: {
            username: 'string',
            email: 'string',
            password: 'string',
          },
        },
        Response: {
          201: 'Registration successful',
          400: 'Bad request because username already exists',
          404: 'failed to register',
          500: 'Internal Server Error',
        },
        Description: 'Registers a new user',
      },

      loginUser: {
        Endpoint: '/api/user/login',
        Method: 'POST',
        Request: {
          Body: {
            username: 'string',
            password: 'string',
          },
        },
        Description: 'login for user',
      },

      getUser: {
        Endpoint: '/api/user',
        Method: 'GET',
        Request: {
          Body: {},
          Headers: {
            accessToken: 'string',
          },
        },
        Response: {
          200: 'retrieve user successfully',
          404: 'user not found',
          500: 'Internal Server Error',
        },
        Description: 'Get user profile based on id in user token',
      },

      changePassword: {
        Endpoint: '/api/user/change-password',
        Method: 'PUT',
        Request: {
          Body: {
            oldPassword: 'string',
            newPassword: 'string',
          },
          Headers: {
            accessToken: 'string',
          },
        },
        Description: "Changes the user's password if the old password matches.",
      },

      sendOtp: {
        Endpoint: '/api/user/otp',
        Method: 'POST',
        Request: {
          Body: {},
          Headers: {
            accessToken: 'string',
          },
        },
        Description: 'Send OTP to email for account activation',
      },

      verifyAccount: {
        Endpoint: '/api/user/verify',
        Method: 'PUT',
        Request: {
          Body: {
            otp: 'string',
          },
          Headers: {
            accessToken: 'string',
          },
        },
        Description: 'input otp that user get from email to activate account',
      },

      forgotPassword: {
        Endpoint: '/api/user/forgot-password',
        Method: 'POST',
        Request: {
          Body: {
            email: 'string',
          },
          Headers: {
            accessToken: 'string',
          },
        },
        Description: "Sends a password reset email to the user's email address.",
      },

      resetPassword: {
        Endpoint: '/pi/user/reset-password?token=token',
        Method: 'PUT',
        Request: {
          Body: {
            email: 'string',
          },
          Headers: {
            accessToken: 'string',
          },
        },
        Description: 'The API sent to the user for password reset containing a token to reset the password ',
      },
    },
    recipes: {
      getRecipe: {
        Endpoint: '/api/recipe',
        Method: 'GET',
        Request: {
          Body: {},
          Header: {
            accessToken: 'string',
          },
        },
        Description: 'List of recipes posted by all users',
      },

      getMyRecipe: {
        Endpoint: '/api/recipe/my',
        Method: 'GET',
        Request: {
          Body: {},
          Header: {
            accessToken: 'string',
          },
        },
        Description: 'List of recipes posted by user logged in based on token',
      },

      postRecipe: {
        Endpoint: 'api/recipe',
        Method: 'POST',
        Request: {
          Body: {
            title: 'string',
            description: 'string',
            ingredients: 'string',
            instructions: 'string',
            path: 'file',
            category: 'string',
          },
          Headers: {
            accessToken: 'string',
          },
        },
        Description: 'post new recipe with authentication',
      },

      putRecipe: {
        Endpoint: '/api/recipe/:id',
        Method: 'PUT',
        Request: {
          Body: {
            title: 'string',
            description: 'string',
            ingredients: 'string',
            instructions: 'string',
            path: 'file',
            category: 'string',
          },
          Headers: {
            accessToken: 'string',
          },
        },
        Description: 'The endpoint for editing a users owned post recipe.',
      },

      deleteRecipe: {
        Endpoint: '/api/recipe/:id',
        Method: 'DELETE',
        Request: {
          Body: {},
          Headers: {
            accessToken: 'string',
          },
        },
        Description: 'The endpoint for delete user owned post recipe.',
      },
    },
  };
  res.json({
    status: 'success',
    statusCode: 200,
    message: 'Get all APIs.',
    data: data,
  });
});

export default documentation;
