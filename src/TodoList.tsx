import React, {createRef} from "react";

interface TodoApi {
    createItem(content: string, successCallback: ((item: ListItem) => void)) : void;
    setItemDone(id: number, done: boolean, successCallback: (() => void)) : void;
    removeItem(id: number, successCallback: (() => void)) : void;
    fetchList(successCallback: ((items: Array<ListItem>) => void)) : void;
}

type ListItem = {
    id: number;
    time: number;
    content: string;
    done: number;
};

type ListItemProps = {
    id: number;
    time: number;
    content: string;
    done: number;
    onListItemRemoved: ((id: number)=>void);
    todoApi: TodoApi;
};

type ListItemState = {
    doneStatus: boolean;
};

class ListItemComponent extends React.Component<ListItemProps, ListItemState>{
    state : ListItemState = {
        doneStatus: !!this.props.done,
    };

    onDoneChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const done = e.target.checked;
        this.props.todoApi.setItemDone(this.props.id, done, () => {
            this.setState({doneStatus: done});
        });
    }

    onRemoveClicked = (): void => {
        this.props.onListItemRemoved(this.props.id);
    }

    render() {
        return <li>
			<span className="item-text">
				{this.props.content}
			</span>
            <span className="item-timestamp">{new Date(this.props.time * 1000).toLocaleString()}</span>
            <input type="checkbox" className="item-done-checkbox" checked={this.state.doneStatus} onChange={this.onDoneChanged}></input>
            <button className="item-remove-button" onClick={this.onRemoveClicked}></button>
        </li>
    }
}

type TodoListState = {
    list: Array<ListItem>;
    ascending: boolean
};

type TodoListProps = {
    api: TodoApi;
    cleanInputOnAdd: boolean;
};

class TodoList extends React.Component<TodoListProps, TodoListState> {
    state : TodoListState = {
        list: new Array<ListItem>(),
        ascending: true
    };

    private todoTextInputRef = createRef<HTMLInputElement>();

    componentDidMount() {
        this.props.api.fetchList((items) => {
            if (this.state.ascending) {
                items.sort((a: ListItem, b: ListItem) => {
                    return a.time > b.time ? 1 : -1;
                });
            } else {
                items.sort((a: ListItem, b: ListItem) => {
                    return a.time < b.time ? 1 : -1;
                });
            }
            this.setState({list: items});
        });
    }

    onAddClick = (): void => {
        const content = this.todoTextInputRef.current?.value || "";
        if (!content) {
            return;
        }

        if (this.props.cleanInputOnAdd && this.todoTextInputRef.current) {
            this.todoTextInputRef.current.value = "";
        }

        this.props.api.createItem(content, (item) => {
            if (this.state.ascending) {
                this.state.list.push(item);
            } else {
                this.state.list.splice(0, 0, item);
            }
            this.setState({list: this.state.list});
        });
    }

    onItemRemoved = (id: number): void => {
        this.props.api.removeItem(id, () => {
            const list = this.state.list;
            for(let i = 0; i < list.length; i++) {
                if (list[i].id === id) {
                    list.splice(i, 1);
                    break;
                }
            }
            this.setState({list: list});
        });
    }

    onSoringChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.checked) {
            this.state.list.sort((a: ListItem, b: ListItem) => {
                return a.time > b.time ? 1 : -1;
            });
        } else {
            this.state.list.sort((a: ListItem, b: ListItem) => {
                return a.time < b.time ? 1 : -1;
            });
        }
        this.setState({list: this.state.list, ascending: e.target.checked});
    }

    render() {
        return (
            <div className="todo-component">
                <div className="todo-add">
                    <input ref={this.todoTextInputRef}></input>
                    <button className="control-button" onClick={this.onAddClick}>Add</button>
                </div>
                <div className="sorting-parameters">
                    Sorting by time
                    <input className="sort-time-order" type="checkbox" checked={this.state.ascending} onChange={this.onSoringChanged}/>
                </div>
                <div className="todo-list-container">
                    <ul className="todo-list">
                        {
                            this.state.list.map((item : ListItem) => {
                                return <ListItemComponent id={item.id} time={item.time} done={item.done} content={item.content} todoApi={this.props.api}
                                                          key={item.id} onListItemRemoved={this.onItemRemoved}></ListItemComponent>;
                            })
                        }
                    </ul>
                </div>
            </div>
        );
    }
}

export type {
    TodoApi,
    ListItem
}

export {
    TodoList
}