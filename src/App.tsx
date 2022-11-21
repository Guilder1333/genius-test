import React from 'react';
import './App.css';
import MessageList from "./Messages";
import logger from "./Logger";
import {ListItem, TodoApi, TodoList} from "./TodoList";

const apiUrl = "http://localhost:5000/api";

class TodoListApiImpl implements TodoApi {

	createItem(content: string, successCallback: (item: ListItem) => void): void {
		fetch(apiUrl + "/create", {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				text: content
			})
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.error) {
					logger.error(data.error);
				} else if (data.item) {
					successCallback(data.item);
				} else {
					logger.error("Got empty response");
				}
			})
			.catch((err) => {
				logger.error(err.message);
			});
	}

	fetchList(successCallback: (items: Array<ListItem>) => void): void {
		fetch(apiUrl + "/list")
			.then((response) => response.json())
			.then((data) => {
				if (data.error) {
					logger.error(data.error);
				} else {
					successCallback(data.items);
				}
			})
			.catch((err) => {
				logger.error(err.message);
			});
	}

	removeItem(id: number, successCallback: () => void): void {
		fetch(apiUrl + "/remove?id=" + id)
			.then((response) => response.json())
			.then((data) => {
				if (data.error) {
					logger.error(data.error);
				} else {
					successCallback();
				}
			})
			.catch((err) => {
				logger.error(err.message);
			});
	}

	setItemDone(id: number, done: boolean, successCallback: () => void): void {
		fetch(apiUrl + "/mark?id=" + id + "&done=" + (+done))
			.then((response) => response.json())
			.then((data) => {
				if (data.error) {
					logger.error(data.error);
				} else {
					successCallback();
				}
			})
			.catch((err) => {
				logger.error(err.message);
			});
	}

}

class App extends React.Component {

	private TodoApiInstance = new TodoListApiImpl();

	render() {
		return (
			<div className="App">
				<TodoList api={this.TodoApiInstance} cleanInputOnAdd={true}></TodoList>

				<MessageList messageLifespan={30} className={"messages-list"}></MessageList>
			</div>
		);
	}
}

export default App;
