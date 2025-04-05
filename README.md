# HRMS Backend API

This is a backend API built using `Express` and `Node.js`. The API implements role-based access control `RBAC`, where only users with the admin role have the ability to `create`, `update`, `delete`, and `export` employee data. Other employees can `login`, `logout`, `refresh tokens`, `view all employees`, and `search/filter` employees based on `name`, `email`, `position`, or `department`.

> How RBAC works
- I have already created a user with the `admin` role.
- When a user tries to access an endpoint that requires `admin` privileges, the API checks if the user's role is admin.
- If the user's role is `admin`, the API allows the user to access the endpoint.
- If the user's role is not admin, the API returns an error message indicating that the user does not have permission to access the endpoint.
- All Employee modification endpoints are protected by the `admin` role.
- Only `admin` can create a new Employee with admin role.

### Admin 
```javascript
{
    "email": "aditya@gmail.com",
    "password": "aditya@01"
}
```

## API Endpoints

## Healthcheck

### `GET` Healthcheck 
```bash
https://hrms-579n.onrender.com/api/v1/healthcheck
```
>This endpoint makes an HTTP GET request to the 
`http://localhost:3000/api/v1/healthcheck` URL.

### Response
>The response of this request is a JSON schema, which can be used to check running status of server.


## Users

### POST `Logout`
```bash
https://hrms-579n.onrender.com/api/v1/users/logout
```
>The `POST` /users/logout endpoint is used to log out a user from the HRMS system.

### Response
>The response returned is a JSON object with the following properties:

- `statusCode` (number): The status code of the response.
- `data` (string): The data related to the response.
- `message` (string): Any message related to the response.
- `success` (boolean): Indicates whether the operation was successful.
> Example:

```javascript
{
    "statusCode": 0,
    "data": "",
    "message": "",
    "success": true
}
```

### `POST` Login
```bash
https://hrms-579n.onrender.com/api/v1/users/login
```
>Login User
This endpoint allows users to log in by providing their email and password.

### Request Body
- `email` (text, required): The email of the user.
- `password` (text, required): The password of the user.
- `Response`
> The response is a JSON object with the following schema:

```javascript
{
  "type": "object",
  "properties": {
    "statusCode": {
      "type": "number"
    },
    "data": {
      "type": "object",
      "properties": {
        "user": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string"
            },
            "username": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "fullname": {
              "type": "string"
            },
            "role": {
              "type": "string"
            },
            "createdAt": {
              "type": "string"
            },
            "updatedAt": {
              "type": "string"
            },
            "__v": {
              "type": "number"
            }
          }
        },
        "accessToken": {
          "type": "string"
        }
      }
    },
    "message": {
      "type": "string"
    },
    "success": {
      "type": "boolean"
    }
  }
}
```

### `Body` raw (json)
```javascript
{
    "email": "aditya@gmail.com",
    "password": "aditya@01"
}
```
### `POST` Refresh-token
```bash
https://hrms-579n.onrender.com/api/v1/refresh-token
```
> The endpoint `http://localhost:3000/api/v1/users/refresh-token` is a POST request used to refresh the user's access token. Upon successful execution, the response will be in JSON format and can be documented as a JSON schema.


## Employees


### `POST` CreateEmployee
```bash
https://hrms-579n.onrender.com/api/v1/employees
```
> Create New Employee
This API endpoint is used to create a new employee in the HR management system.

### Request Body
- `name` (string, required): The name of the employee.
- `email` (string, required): The email address of the employee.
- `password` (string, required): The password for the employee's account.
- `phoneNo` (number, required): The phone number of the employee.
- `position` (string, required): The position or job title of the employee.
- `department` (string, required): The department to which the employee belongs.
- `role` (string, required): The role or designation of the employee.
- `Response`
The response of this request is a JSON object with the following schema:

```javascript
{
  "type": "object",
  "properties": {
    "statusCode": {
      "type": "number"
    },
    "data": {
      "type": "string"
    },
    "message": {
      "type": "string"
    },
    "success": {
      "type": "boolean"
    }
  }
}
```

### `Body` raw (json)
```javascript
{
    "name": "aayushi", 
    "email": "aayushi@gmail.com", 
    "password": "aayushi@01", 
    "phoneNo": 9931471045, 
    "position": "SDE", 
    "department": "Software", 
    "role": "employee"
}
```

### `GET` Exportemployeedetails
```bash
https://hrms-579n.onrender.com/api/v1/employees/export
```
> This endpoint sends an HTTP GET request to retrieve an export of employee data.

### Response
> The response returns a JSON object with the following properties:

- `statusCode` (number): The status code of the response.
- `data` (string): The exported employee data.
- `message` (string): Any additional message related to the response.
- `success` (boolean): Indicates whether the export was successful.
Example:

```javascript
{
  "statusCode": 0,
  "data": "",
  "message": "",
  "success": true
}
```

### `GET` GetEmployeeById
```bash
https://hrms-579n.onrender.com/api/v1/employees/67efe61d113fbafa7646f67a
```
>The endpoint retrieves information about a specific employee by their unique identifier.

### Response
>The response is a JSON object with the following schema:

- `statusCode` (number): The status code of the response.
- `message` (string): A message related to the response.
- `success` (boolean): Indicates whether the request was successful.


### `DELETE` DeleteEmployeebyId
```bash
https://hrms-579n.onrender.com/api/v1/employees/67effdbd52b0041cb978924a
```
>The DELETE request is used to delete a specific employee with the ID 67f0181f0b946584a0b20ad9 from the HRMS system.

### Response
>The response for this request is in JSON format and has the following schema:

```javascript
{
    "type": "object",
    "properties": {
        "statusCode": {
            "type": "integer"
        },
        "data": {
            "type": "string"
        },
        "message": {
            "type": "string"
        },
        "success": {
            "type": "boolean"
        }
    }
}
```

### `GET` GetAllEmployees
```bash
https://hrms-579n.onrender.com/api/v1/employees/
```
>The endpoint retrieves a list of employees.

>The response of the request is a JSON object with the following schema:

```javascript
{
  "type": "object",
  "properties": {
    "statusCode": {
      "type": "number"
    },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "_id": {
            "type": "string"
          },
          "employeeId": {
            "type": "object",
            "properties": {
              "_id": {
                "type": "string"
              },
              "username": {
                "type": "string"
              },
              "email": {
                "type": "string"
              },
              "fullname": {
                "type": "string"
              },
              "password": {
                "type": "string"
              },
              "role": {
                "type": "string"
              },
              "createdAt": {
                "type": "string"
              },
              "updatedAt": {
                "type": "string"
              },
              "__v": {
                "type": "number"
              },
              "refreshToken": {
                "type": "string"
              }
            }
          },
          "name": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "phoneNo": {
            "type": "number"
          },
          "department": {
            "type": "string"
          },
          "position": {
            "type": "string"
          },
          "joiningDate": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string"
          },
          "__v": {
            "type": "number"
          }
        }
      }
    },
    "message": {
      "type": "string"
    },
    "success": {
      "type": "boolean"
    }
  }
}
```

### `PUT` UpdateEmployeedById
```bash
https://hrms-579n.onrender.com/api/v1/employees/67f006e3e096eefb900ccfac
```
>Update Employee Details
This endpoint allows the user to update the details of a specific employee.

### Request Body

- `name` (string): The name of the employee.
- `email` (string): The email address of the employee.
- `password` (string): The password for the employee's account.
- `phoneNo` (number): The phone number of the employee.
- `position` (string): The position or job title of the employee.
- `department` (string): The department to which the employee belongs.
- `role` (string): The role of the employee in the organization.

### Response
```javascript
{
    "type": "object",
    "properties": {
        "statusCode": {
            "type": "integer"
        },
        "data": {
            "type": "string"
        },
        "message": {
            "type": "string"
        },
        "success": {
            "type": "boolean"
        }
    }
}

### Body
```javascript
{
    "name": "aayushi", 
    "email": "aayushi@gmail.com", 
    "password": "aayushi@01", 
    "phoneNo": 9931466633, 
    "position": "SDE", 
    "department": "Software", 
    "role": "employee"
}
```
### `GET` Search/Filter
```bash
https://hrms-579n.onrender.com/api/v1/employees/search?query=sde
```
>The endpoint retrieves a list of employees based on the search query provided. The response returned is a JSON object with the following schema:

```javascript
{
  "type": "object",
  "properties": {
    "statusCode": {
      "type": "number"
    },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "_id": {
            "type": "string"
          },
          "employeeId": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "phoneNo": {
            "type": "number"
          },
          "department": {
            "type": "string"
          },
          "position": {
            "type": "string"
          },
          "joiningDate": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string"
          },
          "__v": {
            "type": "number"
          },
          "score": {
            "type": "number"
          }
        }
      }
    },
    "message": {
      "type": "string"
    },
    "success": {
      "type": "boolean"
    }
  }
}
```

