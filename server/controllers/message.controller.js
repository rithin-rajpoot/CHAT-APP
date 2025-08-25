import Conversation from '../models/conversation.model.js'
import Message from '../models/message.model.js';
import { asyncHandler } from "../utilities/asyncHandler.utility.js";
import { errorHandler } from "../utilities/errorHandler.utility.js";
import { io, getSocketId } from '../socket/socket.js';


export const sendMessage = asyncHandler(
    async (req, res, next) => {
        const senderId = req.user._id;
        const receiverId = req.params.receiverId;
        const { message, image } = req.body;


        if (!senderId || !receiverId || !message) {
            return next(new errorHandler("All fields are required", 400));
        }

        let imageUrl = '';

        if (image) {
            // Upload image to cloudinary
            const result = await cloudinary.uploader.upload(image);
            imageUrl = result.secure_url;
        }

        // Before sending the message, check whether there is a past conversation,
        //  if yes, send message in the same conversation, else create a new conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }, // returns the conversation which contains both sender and receiver 
        })
        // if conversation doesn't exist, create a new conversation
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            })
        }
        // Now create a new message
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message,
            image: imageUrl,
        });
        // Update the conversation with the new message
        conversation.messages.push(newMessage._id);
        await conversation.save();

        // web socket implementation
        io.to(getSocketId(receiverId)).emit('newMessage', newMessage);

        res.status(200).json({
            success: true,
            message: "Message sent successfully",
            conversationId: conversation._id,
            responseData: newMessage
        });
    }
)

export const getConversationMessages = asyncHandler(
    async (req, res, next) => {
        const myId = req.user._id;
        const otherParticipantId = req.params.receiverId;

        if (!myId || !otherParticipantId) {
            return next(new errorHandler("All fields are required", 400));
        }



        // find the conversation first
        const conversation = await Conversation.findOne({
            participants: { $all: [myId, otherParticipantId] },
        });
        if (!conversation) {
            return res.status(200).json({
                success: true,
                messages: [],
                nextCursor: null,
            });
        }

        // pagination params
        const limit = Math.min(parseInt(req.query.limit) || 20, 50); // default limit is 20, max limit is 50
        const cursor = req.query.cursor; // ISO date string (createdAt)

        // build query for messages
        // build query for messages - query by message IDs in the conversation
        const query = { _id: { $in: conversation.messages } };
        if (cursor) {
            query.createdAt = { $lt: new Date(cursor) };
        }

        const docs = await Message.find(query)
            .sort({ createdAt: -1 }) // newest -> oldest
            .limit(limit + 1);

        const hasMore = docs.length > limit;
        const items = hasMore ? docs.slice(0, limit) : docs;

        const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

        res.status(201).json({
            success: true,
            messages: items,
            nextCursor,
        });
    }
)

export const clearChat = asyncHandler(async (req, res, next) => {
    const myId = req.user._id;
    const otherParticipantId = req.params.receiverId;

    if (!myId || !otherParticipantId) {
        return next(new errorHandler("All fields are required", 400));
    }

    // Find the conversation involving both users
    const conversation = await Conversation.findOne({
        participants: { $all: [myId, otherParticipantId] },
    });

    if (!conversation) {
        return res.status(200).json({
            success: true,
            message: "No conversation found",
        });
    }

    // Delete all messages associated with this conversation and update in the other participant's UI
    await Message.deleteMany({ _id: { $in: conversation.messages } });
    io.to(getSocketId(otherParticipantId)).emit('clearedChat');

    // Clear the messages array in the conversation document
    conversation.messages = [];
    await conversation.save();

    res.status(200).json({
        success: true,
        message: "Chat cleared successfully",
    });
});



