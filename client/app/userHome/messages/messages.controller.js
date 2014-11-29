'use strict';

angular.module('freeNycApp')
  .controller('MessagesCtrl', function ($scope, Auth, messageService, $state) {
    
    var vm = this;
    $scope.newMessage = {
    	body: "",
        sender: {}, 
        recipient: {}
    }; 
    $scope.showMe = {};
    $scope.userId = Auth.getCurrentUser()._id;
    $scope.numMessages = Auth.getCurrentUser().numMessages

    console.log('numMessages', $scope.numMessages)
    //gets all messages for the signed in user
    messageService.getMyMessages(function(data) {
		$scope.communication = data;
        // console.log('data', $scope.communication)
        for (var i = 0; i < $scope.communication.length; i++) {
            var temp = $scope.communication[i].conversants;
            // console.log('temp', temp, 'conversants: ', $scope.communication[i])
            for (var j = 0; j < temp.length; j++) {
                if (temp[j]._id !== $scope.userId) {
                   $scope.communication[i].conversants = temp[j];
                   // console.log('conversants', $scope.communication[i].conversants)
                }
            };
        };
    });

    //click event that displays the message field so the user can respond
    vm.replyButton = function(index, parentIndex){
        $scope.showMe[parentIndex][index] = true;
    }

    //click event that adds user's response to the messages array in the communication
    vm.reply = function(convoId, index, parentIndex){
        console.log('parameters: ', convoId, index, parentIndex)
        console.log('index', $scope.communication[parentIndex].messages[index])
        if ($scope.userId === $scope.communication[parentIndex].messages[index].recipient._id) {

            $scope.newMessage.sender._id = $scope.userId; 
            $scope.newMessage.recipient._id = $scope.communication[parentIndex].messages[index].sender._id
            $scope.newMessage.recipient.name = $scope.communication[parentIndex].messages[index].sender.name
        }
        else if ($scope.userId === $scope.communication[parentIndex].messages[index].sender._id) {
            $scope.newMessage.recipient._id = $scope.userId; 
            $scope.newMessage.sender._id = $scope.communication[parentIndex].messages[index].recipient._id
            $scope.newMessage.sender.name = $scope.communication[parentIndex].messages[index].recipient.name
        }
        console.log('second new message', $scope.newMessage)
    	messageService.replyToMessage(convoId, $scope.newMessage, function(result){
            $scope.showMe[parentIndex][index] = false;
    	})
    }

    //sets showMe to true 
    vm.showMessages = function(index, talkId) {
        if($scope.showMe[index] === undefined) {
            $scope.showMe[index] = {show: undefined}
        }
        if($scope.showMe[index].show === true) {
            $scope.showMe[index].show = false;
        } else {$scope.showMe[index].show = true;}

        // console.log('convo id', talkId)
        //make sure this function is properly using index

        messageService.adjustNumNewMessages(talkId, function(result){
            if ($scope.communication[index].numNewMessages > 0){
                $scope.communication[index].numNewMessages = result.numMessages;
                if($scope.numMessages > 0){
                    $scope.numMessages -= 1; 
                }
            }
        })
    }
});
      