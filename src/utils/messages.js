const generateMessage = (username, messageText) => {
    return {
        username,
        text: messageText,
        createdAt: new Date().getTime()
    }
};

const generateLocationMessage = (username, locationUrl) => {
    return {
        username,
        url: locationUrl,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}
