# Simple task manager App

## [Click here to view demo online](https://pesto-task-manager.netlify.app/)

## Libraries used

React.js, Material-UI, React-Virtuoso, Firebase, Jotai, and MSW

## Main features of the app

### 1. State management

The app uses jotai library (atom) to maintain application state. All API requests are executed MSW and cached in local storage for faster performance. I have created a custom hook to make API requests and handle it's error and loading states with proper loading spinners and animation transitions.

On initial page load, tasks will be fetched from server (firebase for database) and rendered using react-virtuoso to ensure huge lists can be rendered with very high performance.

### 2. Responsive design implementation

The app is responsive and works perfectly on mobile and desktop via media queries to customize styles on various screen sizes. I have extensively tested in all major browsers and mobile as well.

### 3. Filtering and sorting of tasks

In the TasksList.tsx file there are dropdowns implemented for user to filter tasks by status and to sort the tasks on due date or title (alphabetically) or even on recently updated tasks, both ascending and descending orders

### 4. Search tasks by title or name

In the TasksList.tsx file there is a text field in which user can type to search the tasks list with a debounce functionality to prevent too many API requests

### 5. API implementation

Using MSW library I have implemented and used CRUD API's for tasks using Node.js - fetch tasks, create task, update task, and delete task.

### 6. CreateTaskForm.tsx file for creating new tasks

User can create a new task by clicking on the add task button. The title, description, and due date fields have to be filled with both server side and client side validations to create a new task

### 7. EditTaskModal.tsx file for updating existing tasks

User can update any existing task by clicking on the edit icon. The title, description, status, and due date properties can be updated with both server side and client side validation to update existing task

### 8. TaskList.tsx file to view all tasks and delete any task

User can delete any existing task by clicking on delete icon which also renders a confirmation modal popup to prevent accidental deletions.

### 9. Authentication and security using firebase authentication and firestore rules

User has to be logged in before viewing his tasks. All user generated inputs are sanitized to prevent XSS attacks. Firebase security rules are written in `firebase.json` file to ensure authorization for all CRUD requests.
