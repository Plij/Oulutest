/*
 *   Authors: Xiaori Hu 
 *   MumlbeFunc.js includes most of the functions handling the events happening in the mumble 
 *
 */

/*
 *  Set the state of connection, and all buttons(excpet connect button) in widget of mumble client 
 *	aren't enable before the mumble actually connects to mumble server.
 */
	function SetConnectionState(connected, strState)
	{
		var stateLabel = findChild(_mumbleClientWidget, "labelConnectionState");
		stateLabel.text = strState;
	
		_buttonConnect.enabled = !connected;
		_buttonDisconnect.enabled = connected;
		_buttonWizard.enabled = connected;
		_buttonSelfMute.enabled = connected;
		_buttonSelfDeaf.enabled = connected;
	}
/*
 * set the mumble server channnle name, the default value is Root if keeping it blank. 
 */
	function SetChannelName(channelName)
	{
		var channelLabel = findChild(_mumbleClientWidget, "labelChannelName");
		channelLabel.text = channelName;
	}
/*
 *  Everytime connecting to server, it will get all parameters from the connection widget in case that some parameters are modified. 
 */
	function GetConnectionDataWidgets(widget)
	{
		if (widget == null)
			return null;
	
		var widgets =
		{
			host : findChild(widget, "hostLineEdit"),
			port : findChild(widget, "portSpinBox"),
			username : findChild(widget, "usernameLineEdit"),
			password : findChild(widget, "passwordLineEdit"),
			channel : findChild(widget, "channelLineEdit"),
			connectButton : findChild(widget, "buttonConnect"),
			cancelButton : findChild(widget, "buttonCancel")
		};
	
		return widgets;
	}
	
/*
 *   connect to server via using the mumble plugin and also show the state of connection
 */
	function Connect()
	{
		var widgets = GetConnectionDataWidgets(_mumbleConnectWidget);
		mumble.Connect(widgets.host.text, widgets.port.value, widgets.username.text, widgets.password.text, widgets.channel.text, _connectionInfo.outputMuted, _connectionInfo.intputMuted);
	
		MumbleConnectProxy.visible = false;
		//_mumbleConnectWidget.visible = false;
		SetConnectionState(false, "Connecting to " + widgets.host.text + ":" + widgets.port.value.toString() + "...");  
	}
	
/*
 *   show the reason of failing to connect to server
 */
	function OnRejected(rejectType, reason)
	{
		// enum RejectReasonWrongServerPW
		if (rejectType.value == 4)
			QMessageBox.warning(ui.MainWindow(), "", reason);
		// enum RejectReasonServerFull
		else if (rejectType.value == 6)
			QMessageBox.warning(ui.MainWindow(), "", "Server is full");
	}
	
/*
 * show the state of connection when succfully connect to server
 */
	function OnConnected(host, port, username)
	{
		SetConnectionState(true, "Connected to " + host + ":" + port.toString() +'<br>' + " as "+ username);
	}
	
/*
 * show the reason of disconnecting to server
 */
	function OnDisconnected(reason)
	{
		if (reason != "")
			SetConnectionState(false, "Disconnected: " + reason);
		else
			SetConnectionState(false, "Disconnected");
	}
	
	function OnMeCreated(mumbleMe)
	{
		// Can hook to own user ptr signals here.
		// Depends if you want to use own functions for processing 'me' signals.
		// Or a generic function to handle all like this example script shows.
		// You can use the signaling model you feel is best for you.
	}
	
/*
 *  show the users joining to channel of server
 */
	function OnJoinedChannel(mumbleChannel)
	{
		SetChannelName(mumbleChannel.fullName);
	
		mumbleChannel.UserJoined.connect(OnUserJoinedPresentChannel);
		mumbleChannel.UserLeft.connect(OnUserLeftPresentChannel);
	}
	
/*
 *  get the user via user identification number from server
 */
	function GetUser(userId)
	{
		var user = null;
		for(var i=0; i<_userList.count; ++i)
		{
			var item = _userList.item(i);
			if (item != null && item.data(Qt.UserRole) == userId)
			{
				user = { listItem: item, row: i };
				break;
			}
		}
		return user;
	}
	
/*
 *   show the current user joining to channel of server
 */
	function OnUserJoinedPresentChannel(user)
	{
		//var listItem = new QListWidgetItem(_iconInactive, user.name + " (" + user.id.toString() + ")");
		var listItem = new QListWidgetItem(user.name + " (" + user.id.toString() + ")");
		listItem.setData(Qt.UserRole, user.id);
	
		if (user.isMe)
		{
			var font = listItem.font();
			font.setBold(true);
			listItem.setFont(font);
		}
	
		_userList.addItem(listItem);
	}
	
/*
 *   show the user of leaving current channel of server
 */
	function OnUserLeftPresentChannel(userId)
	{
		var listItem = GetUser(userId);
		if (listItem != null)
			//_userList.takeAt(listItem.row);
			_userList.takeItem(listItem.row);
	}
	
/*
 *  focus on the selected user in the userlist
 */
	function OnUserSelected(listItem)
	{
		if (listItem == null)
			listItem = _userList.currentItem();
		if (listItem != null && listItem.data(Qt.UserRole) != null)
		{
			var mumbleUser = mumble.User(listItem.data(Qt.UserRole));
			if (mumbleUser.isMe)
			{
				_buttonMuteSelected.enabled = false;
				_buttonMuteSelected.text = "";
			}
			else
			{
				_buttonMuteSelected.enabled = true;
				_buttonMuteSelected.text = mumbleUser.isMuted ? "Unmute " + mumbleUser.name : "Mute " + mumbleUser.name;
			}
		}
	}
	
/*
 *  respond to the event of mute self
 */
	function OnSelfMuteToggle()
	{
		var mumbleMe = mumble.Me();
		if (mumbleMe != null)
			mumble.SetOutputAudioMuted(!mumbleMe.isSelfMuted);
	}
	
/*
 *  respond to the event of deaf self
 */
	function OnSelfDeafToggle()
	{
		var mumbleMe = mumble.Me();
		if (mumbleMe != null)
			mumble.SetInputAudioMuted(!mumbleMe.isSelfDeaf);
	}
	
/*
 *  mute the selected user
 */
	function OnMuteSelectedToggle()
	{
		var currentItem = _userList.currentItem();
		if (currentItem != null && currentItem.data(Qt.UserRole) != null)
		{
			var user = mumble.User(currentItem.data(Qt.UserRole));
			if (user != null && !user.isMe)
				user.isMuted = !user.isMuted;
		}
	}
	
/*
 *  update the state of user
 */
	function UpdateUserState(mumbleUser)
	{
		var iter = GetUser(mumbleUser.id);
		if (iter != null)
		{
			var text = mumbleUser.name + " (" + mumbleUser.id.toString() + ")";
			var props = [];
			if (mumbleUser.isMuted)
				props.push("muted");
			if (mumbleUser.isSelfMuted)
				props.push("self muted");
			if (mumbleUser.isSelfDeaf)
				props.push("deaf");
			if (!mumbleUser.isPositional)
				props.push("non-positional");
			if (props.length > 0)
				text += " [" + props.join(", ") + "]";
			iter.listItem.setText(text);
	
			//OnUserSelected(iter.listItem);
		}
	}
	
/*
 *    the state of muting local users changes. 
 */
	function OnUserLocalMuteChanged(mumbleUser, isMuted)
	{
		UpdateUserState(mumbleUser);
	}
	
/*
 *    the state of muting self changes.
 */
	function OnUserSelfMutedChange(mumbleUser, isMuted)
	{
		UpdateUserState(mumbleUser);
		if (mumbleUser.isMe)
			_buttonSelfMute.text = mumbleUser.isSelfMuted ? "Unmute Self" : "Mute self";
	}
	
/*
 *     the state of deafing self changes.
 */
	function OnUserSelfDeafChange(mumbleUser, isDeaf)
	{
		UpdateUserState(mumbleUser);
		if (mumbleUser.isMe)
			_buttonSelfDeaf.text = mumbleUser.isSelfDeaf ? "Unmute Everyone" : "Mute Everyone";
	}
	
/*
 *      the position of user changes, here it doesn't need to show the user position, remain it to be used in the future. 
 */
 
//	function OnUserPositionalChange(mumbleUser, isPositional)
//	{
//		UpdateUserState(mumbleUser);
//	}

/*
 *  speak to concrete user,here it doesn't need to show the icon status, remain it to be used in the future.
 */
//	function OnUserSpeakingChange(mumbleUser, speaking)
//	{
//		var iter = GetUser(mumbleUser.id);
//		if (iter != null)
//			iter.listItem.setIcon(speaking ? _iconActive : _iconInactive);
//	}
	
/*
 *   send the text message 
 */
	function SendTextMessage()
	{
		var message = _chatLine.text;
		if (message != "")
		{
			// Own messages are of course not relayed back to us, add by hand.
			OnChannelTextMessageReceived(mumble.Me(), message);
			// Send message to current channel.
			mumble.SendTextMessage(message);
			_chatLine.text = "";
		}
	}
	
/*
 *  receive the text message from concrete user in the channel
 */
	function OnChannelTextMessageReceived(mumbleUser, message)
	{
		if (message != "")
			_chatLog.appendHtml("[<span style=\"color:" + (mumbleUser.isMe == true ? "red" : "blue") + ";\">" + mumbleUser.name + "</span>] " + message);
	}
	
	// Bootstrap and utility functions
	
	
	function LogInfo(msg)  { console.LogInfo("[MumbleApplication]: " + msg);  }
	function LogError(msg) { console.LogError("[MumbleApplication]: " + msg); }