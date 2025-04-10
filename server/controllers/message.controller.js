import Conversation from '../models/conversation.model.js'
import Message from '../models/message.model.js';
import { asyncHandler } from "../utilities/asyncHandler.utility.js";
import { errorHandler } from "../utilities/errorHandler.utility.js";
import { io, getSocketId } from '../socket/socket.js';


export const sendMessage = asyncHandler(
    async (req, res, next) => {
        const senderId = req.user._id;
        const receiverId = req.params.receiverId;
        const message = req.body.message;

        if(!senderId || !receiverId || !message){
            return next(new errorHandler("All fields are required", 400));
        }

        // Before sending the message, check whether there is a past conversation,
        //  if yes, send message in the same conversation, else create a new conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId]}, // returns the conversation which contains both sender and receiver 
        })
        // if conversation doesn't exist, create a new conversation
        if(!conversation){
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            })
        }
        // Now create a new message
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        })
        // Update the conversation with the new message
        conversation.messages.push(newMessage._id); //pushing the new message in the created or existing conversation array (refer the model)
        await conversation.save();

        // web socket implementation
        io.to(getSocketId(receiverId)).emit('newMessage', newMessage);


        res.status(201).json({
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

        if(!myId || !otherParticipantId){
            return next(new errorHandler("All fields are required", 400));
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [myId, otherParticipantId]}, // returns the conversation which contains both sender and receiver 
        }).populate('messages');

        res.status(201).json({
            success: true,
            responseData: conversation,
        });
    }
)

// export const getConversationMessages = asyncHandler(
//     async (req, res, next) =>{
//         const conversationId = req.params.conversationId;
//         if(!conversationId){
//             return next(new errorHandler("Conversation ID is required", 400));
//         }
//         // find the conversation and its messages
//         const conversation = await Conversation.findById(conversationId).populate('messages');
//         if(!conversation){
//             return next(new errorHandler("No conversation found with this ID", 404));
//         }
//         res.status(200).json({
//             success: true,
//             conversation: conversation.messages
//         });
//     }
// )