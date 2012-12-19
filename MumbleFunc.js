/*
	 *   handle the events happening in the mumble 
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
	
	function SetChannelName(channelName)
	{
		var channelLabel = findChild(_mumbleClientWidget, "labelChannelName");
		channelLabel.text = channelName;
	}
	
	function ShowConnectDialog()
	{
		 //Initialize if not yet done
		if (_mumbleConnectWidget == null)
		{
			//_connectWidget = ui.LoadFromFile("local://MumbleConnectWidget.ui");			
			_mumbleConnectWidget = ui.LoadFromFile("Scripts/MumbleConnectWidget.ui",false);
			MumbleConnectProxy = new UiProxyWidget(_mumbleConnectWidget);
			ui.AddProxyWidgetToScene(MumbleConnectProxy);
			
			MumbleConnectProxy.windowFlags = 0;
			MumbleConnectProxy.x = 2 + 248;
			MumbleConnectProxy.y = 42;
			
			var widgets = GetConnectionDataWidgets(_mumbleConnectWidget);
			//console.LogInfo("_mumbleConnectWidget:"+_mumbleConnectWidget);
			//console.LogInfo("widgets:"+widgets);
			widgets.connectButton.clicked.connect(Connect);
			widgets.cancelButton.clicked.connect(_mumbleConnectWidget, _mumbleConnectWidget.hide);
	
			widgets.host.text = _connectionInfo.host;
			widgets.port.value = _connectionInfo.port;
			widgets.password.text = _connectionInfo.password;
			widgets.channel.text = _connectionInfo.channel;
			if (client != null && client.LoginProperty("username") != "")
				widgets.username.text = client.LoginProperty("username");
			else
				widgets.username.text = "Tom";
		}
	    MumbleConnectProxy.visible = true;
		//_mumbleConnectWidget.visible = true;	
	}
	
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
	
	function Connect()
	{
		var widgets = GetConnectionDataWidgets(_mumbleConnectWidget);
		mumble.Connect(widgets.host.text, widgets.port.value, widgets.username.text, widgets.password.text, widgets.channel.text, _connectionInfo.outputMuted, _connectionInfo.intputMuted);
	
		MumbleConnectProxy.visible = false;
		//_mumbleConnectWidget.visible = false;
		SetConnectionState(false, "Connecting to " + widgets.host.text + ":" + widgets.port.value.toString() + "...");  
	}
	
	function OnRejected(rejectType, reason)
	{
		// enum RejectReasonWrongServerPW
		if (rejectType.value == 4)
			QMessageBox.warning(ui.MainWindow(), "", reason);
		// enum RejectReasonServerFull
		else if (rejectType.value == 6)
			QMessageBox.warning(ui.MainWindow(), "", "Server is full");
	}
	
	function OnConnected(host, port, username)
	{
		SetConnectionState(true, "Connected to " + host + ":" + port.toString() +'<br>' + " as "+ username);
	}
	
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
	
	function OnJoinedChannel(mumbleChannel)
	{
		SetChannelName(mumbleChannel.fullName);
	
		mumbleChannel.UserJoined.connect(OnUserJoinedPresentChannel);
		mumbleChannel.UserLeft.connect(OnUserLeftPresentChannel);
	}
	
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
	
	function OnUserJoinedPresentChannel(user)
	{
		var listItem = new QListWidgetItem(_iconInactive, user.name + " (" + user.id.toString() + ")");
		listItem.setData(Qt.UserRole, user.id);
	
		if (user.isMe)
		{
			var font = listItem.font();
			font.setBold(true);
			listItem.setFont(font);
		}
	
		_userList.addItem(listItem);
	}
	
	function OnUserLeftPresentChannel(userId)
	{
		var listItem = GetUser(userId);
		if (listItem != null)
			_userList.takeAt(listItem.row);
	}
	
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
	
	function OnSelfMuteToggle()
	{
		var mumbleMe = mumble.Me();
		if (mumbleMe != null)
			mumble.SetOutputAudioMuted(!mumbleMe.isSelfMuted);
	}
	
	function OnSelfDeafToggle()
	{
		var mumbleMe = mumble.Me();
		if (mumbleMe != null)
			mumble.SetInputAudioMuted(!mumbleMe.isSelfDeaf);
	}
	
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
	
	function OnUserLocalMuteChanged(mumbleUser, isMuted)
	{
		UpdateUserState(mumbleUser);
	}
	
	function OnUserSelfMutedChange(mumbleUser, isMuted)
	{
		UpdateUserState(mumbleUser);
		if (mumbleUser.isMe)
			_buttonSelfMute.text = mumbleUser.isSelfMuted ? "Unmute Self" : "Mute self";
	}
	
	function OnUserSelfDeafChange(mumbleUser, isDeaf)
	{
		UpdateUserState(mumbleUser);
		if (mumbleUser.isMe)
			_buttonSelfDeaf.text = mumbleUser.isSelfDeaf ? "Unmute Everyone" : "Mute Everyone";
	}
	
	function OnUserPositionalChange(mumbleUser, isPositional)
	{
		UpdateUserState(mumbleUser);
	}
	
	function OnUserSpeakingChange(mumbleUser, speaking)
	{
		var iter = GetUser(mumbleUser.id);
		if (iter != null)
			iter.listItem.setIcon(speaking ? _iconActive : _iconInactive);
	}
	
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
	
	function OnChannelTextMessageReceived(mumbleUser, message)
	{
		if (message != "")
			_chatLog.appendHtml("[<span style=\"color:" + (mumbleUser.isMe == true ? "red" : "blue") + ";\">" + mumbleUser.name + "</span>] " + message);
	}
	
	// Bootstrap and utility functions
	
	
	function LogInfo(msg)  { console.LogInfo("[MumbleApplication]: " + msg);  }
	function LogError(msg) { console.LogError("[MumbleApplication]: " + msg); }