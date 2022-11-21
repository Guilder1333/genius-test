import React from "react";
import logger from "./Logger";

type MessageItem = {
    message: string;
    creationTime: Date;
    type: "info" | "warning" | "error"
};

class MessageComponent extends React.Component<{ item: MessageItem }, any> {
    render() {
        return <div className={"message-item message-type-" + this.props.item.type}>
            <span className="message-text">{this.props.item.message}</span>
            <span className="message-date">{this.props.item.creationTime.toLocaleString()}</span>
        </div>
    }
}

type MessageListProps = {
    messageLifespan: 30;
    className: string;
};

type MessageListState = {
    messages: Array<MessageItem>;
};

class MessageList extends React.Component<MessageListProps, MessageListState>{
    state : MessageListState = {
        messages: new Array<MessageItem>()
    };

    private timeoutId: number = 0;

    componentDidMount() {
        logger.logOverride = (message: string) => {
            this.pushMessage(message, "info");
        };
        logger.warnOverride = (message: string) => {
            this.pushMessage(message, "warning");
        };
        logger.errorOverride = (message: string) => {
            this.pushMessage(message, "error");
        };
    }

    pushMessage(message: string, type: "info" | "warning" | "error") {
        if (type === "warning") {
            console.warn(message);
        } else if (type === "error") {
            console.error(message);
        } else {
            console.log(message);
        }

        const item : MessageItem = {
            message: message,
            type: type,
            creationTime: new Date()
        };
        if (!this.state.messages.length) {
            this.timeoutId = window.setTimeout(() => {
                this.removeMessages();
            }, this.props.messageLifespan * 1000);
        }
        this.state.messages.push(item);
        this.setState({messages: this.state.messages});
    }

    removeMessages() {
        if (this.timeoutId) {
            window.clearTimeout(this.timeoutId);
            this.timeoutId = 0;
        }
        let i = 0;
        const expiredTime = new Date().getTime() - this.props.messageLifespan * 1000;
        const messages = this.state.messages;
        for(; i < messages.length; i++) {
            if (messages[i].creationTime.getTime() > expiredTime) {
                break;
            }
        }
        if (i > 0) {
            messages.splice(0, i);
        }
        if (messages.length) {
            const interval = messages[0].creationTime.getTime() - expiredTime;
            this.timeoutId = window.setTimeout(() => {
                this.removeMessages();
            }, interval);
        }
        this.setState({messages: messages});
    }

    render() {
        return <div className={this.props.className}>
            {
                this.state.messages.map((message : MessageItem) => {
                    return <MessageComponent item={message}></MessageComponent>
                })
            }
        </div>;
    }
}

export default MessageList;