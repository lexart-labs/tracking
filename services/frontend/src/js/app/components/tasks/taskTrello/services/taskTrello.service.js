(function (ng) {

	'use strict';

    var Module = ng.module('LexTracking');

	Module.factory('tasks_trelloServices', ['RestClient', function (RestClient) {

		var model = "projects/tasks/trello";
		var key = "2f132aeb2a02c90e0966cbcfd9f45329";
		var token = "c9e22df4e936322b7949cc9b98c0e972f8991099f8bbb5733e70956abcd06ff4";

		var factory = {

			find: function (page, q, cb) {
				RestClient.get(model + "/all", function (err, result, countItems) {
					cb(err, result, countItems);
				})
			},

			findById: function (id, cb) {
				RestClient.get(model + "/" + id, function (err, result) {
					cb(err, result);
				})
			},

			findByIdCard: function (page, q, cb) {
				RestClient.get(model + "/allOld", function (err, result, countItems) {
					cb(err, result);
				})
			},

			findByIdClient: function (id, cb) {
				RestClient.get(model + "/id-client/" + id, function (err, result) {
					cb(err, result);
				})
			},

			findByIdUser: function (id, cb) {
				RestClient.get(model + "/id-user/" + id, function (err, result) {
					cb(err, result);
				})
			},

			findAll: function (page, q, cb) {
				RestClient.get(model + "?sort[name]=1" + q, function (err, result) {
					cb(err, result);
				})
			},

			save: function (obj, cb) {
				if (obj.id) {
					RestClient.put(model + "/" + obj.id, obj, function (err, result) {
						cb(err, result);
					})
				} else {
					RestClient.post(model, obj, function (err, result) {
						cb(err, result);
					})
				}
			},

			remove: function (id, cb) {
				RestClient.get(model + "/remove-trello-task/" + id, function (err, result) {
					cb(err, result);
				})
			},

			deleteBoardTrello: function (id, cb) {
				RestClient.get(model + '/remove-board/' + id, function (err, result) {
					cb(err, result)
				})
			},

			saveTask_trello: function (obj, cb) {
				if (obj.id) {
					RestClient.post(model + "/update", obj, function (err, result) {
						cb(err, result);
					})
				} else {
					RestClient.post(model + "/new", obj, function (err, result) {
						cb(err, result);
					})
				}
			},

			saveTaskTrello: function (obj, cb) {
				RestClient.post(model + "/newOld", obj, function (err, result) {
					cb(err, result);
				})
			},

			getCards: function (obj, cb) {
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("GET", "https://api.trello.com/1/cards/" + obj + "?attachments=false&attachment_fields=all&members=false&membersVoted=false&checkItemStates=false&checklists=none&checklist_fields=all&board=false&list=false&pluginData=false&stickers=false&sticker_fields=all&customFieldItems=false&key=" + key + "&token=" + token);
				xhr.send(data);
			},

			getBoardsId: function (obj, cb) {
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("GET", 'https://api.trello.com/1/boards/' + obj + '/cards/?limit=1000&fields=name&members=true&member_fields=fullName&key=' + key + '&token=' + token);
				xhr.send(data);
			},

			getLists: function (obj, cb) {
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("GET", 'https://api.trello.com/1/boards/'+obj+'/lists/?limit=1000&fields=name&members=true&member_fields=fullName&key='+key+'&token='+token);
				xhr.send(data);
			},

			getListByCard: function(obj,cb){
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("GET", 'https://api.trello.com/1/cards/'+obj+'/list/?limit=1000&fields=name&members=true&member_fields=fullName&key='+key+'&token='+token);
				xhr.send(data);
			},//GET /1/cards/{id}/list

			getCardByLists: function(obj, cb){
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("GET", 'https://api.trello.com/1/lists/'+obj+'/cards/?limit=1000&fields=name&members=true&member_fields=fullName&key='+key+'&token='+token);
				xhr.send(data);
				//GET /1/lists/{id}/cards

			},

			getLabels: function (obj, cb) { //GET LABELS BOARD
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("GET", "https://api.trello.com/1/boards/" + obj + "/labels?fields=all&limit=50&key=" + key + "&token=" + token);
				xhr.send(data);
			},

			deleteLabel: function (obj, cb) {
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("DELETE", "https://api.trello.com/1/labels/" + obj + "?key=" + key + "&token=" + token);
				xhr.send(data)
			},

			activateLabel: function (label, cb) {
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("POST", "https://api.trello.com/1/cards/" + label.id + "/labels?color=" + label.color + "&name=" + label.name + "&key=" + key + "&token=" + token);
				xhr.send(data);
			},

			createLabel: function (id, color, name, cb) {
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("POST", "https://api.trello.com/1/boards/" + id + "/labels?name=" + name + "&color=" + color + "&key=" + key + "&token=" + token);
				xhr.send(data);
			},

			getLabelsByCard: function (obj, cb) {
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("GET", "https://api.trello.com/1/cards/" + obj + "/labels?key=" + key + "&token=" + token);
				xhr.send(data);
			},

			desactiveLabel: function (idCard, idLabel, cb) {
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("DELETE", "https://api.trello.com/1/cards/" + idCard + "/idLabels/" + idLabel + "?key=" + key + "&token=" + token);
				xhr.send(data);

			},

			selectLabel: function (idCard, idLabel, cb) {
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("POST", "https://api.trello.com/1/cards/" + idCard + "/idLabels?value=" + idLabel + "&key=" + key + "&token=" + token);
				xhr.send(data);
			},

			getBoards: function (cb) {
				var data = {};
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("GET", "https://api.trello.com/1/members/lexartbrain/boards?filter=all&fields=all&lists=none&memberships=none&organization=false&organization_fields=name%2CdisplayName&key=" + key + "&token=" + token);
				xhr.send(data);
			},

			saveBoards: function (obj, cb) {
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = this.responseText;
						cb(resp);
					}
				})
				console.log("ObjBoard::", obj);
				xhr.open("POST", BASE_URL + 'projects/tasks/trello/boards/new', true);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.setRequestHeader('Authorization', window.localStorage["lextracking-web-token"]);
				xhr.send(JSON.stringify(obj));
			},

			updateLabelTask: function (idCard, data, cb) {
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = this.responseText;
						cb(resp);
					}
				})
				xhr.open("POST", "https://api.trello.com/1/cards/" + idCard + "/idLabels?value=" + data + "&key=" + key + "&token=" + token, true);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.send(JSON.stringify({ value: data }));
			},

			addComment: function (card, cb) {
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = this.responseText;
						cb(resp);
					}
				})
				xhr.open("POST", "https://api.trello.com/1/cards/" + card.card_id + "/actions/comments&key=" + key + "&token=" + token, true);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.send(JSON.stringify(card.description));
			},

			updateCard: function (card, cb) {
				var xhr = new XMLHttpRequest();
				var toSend = {
					key: key,
					token: token,
					name: card.name
				}
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = this.responseText;
						cb(resp);
					}
				});
				xhr.open("PUT", "https://api.trello.com/1/cards/" + card.card_id, true);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.send(JSON.stringify(toSend));
			},

			getMembers: function (board, cb) {
				console.log(board);
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("GET", 'https://api.trello.com/1/boards/' + board + '/members/?limit=1000&fields=name&members=true&member_fields=fullName&key=' + key + '&token=' + token);
				xhr.send(data);
			},

			getMemberById: function (member, cb) {
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("GET", 'https://api.trello.com/1/members/' + member + '?key=' + key + '&token=' + token);
				xhr.send(data);
			},

			getCardMembers: function (card, cb) {
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("GET", 'https://api.trello.com/1/cards/' + card + '/members?key=' + key + '&token=' + token);
				xhr.send(data);
			},

			assignMember: function (obj, cb) {
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = this.responseText;
						cb(resp);
					}
				})
				xhr.open("POST", "https://api.trello.com/1/cards/" + obj.idCard + "/idMembers?key=" + key + "&token=" + token, true);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.send(JSON.stringify({ value: obj.idMember }));
			},

			unassignMember: function (obj, cb) {
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("DELETE", "https://api.trello.com/1/cards/" + obj.idCard + "/idMembers/" + obj.idMember + "?key=" + key + "&token=" + token);
				xhr.send(obj)
			},

			getChecklistCard: function (idCard, cb) {
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = JSON.parse(this.responseText);
						cb(resp);
					}
				});
				xhr.open("GET", "https://api.trello.com/1/cards/" + idCard + "/checklists?checkItems=all&key=" + key + "&token=" + token);
				xhr.send(data)
			},

			updateChecklistCard: function (itemChecklist, cb) {
				var xhr = new XMLHttpRequest();
				var toSend = {
					key: key,
					token: token,
					state: itemChecklist.state
				}
				xhr.addEventListener("readystatechange", function (resp) {
					if (this.readyState === this.DONE) {
						var resp = this.responseText;
						cb(resp);
					}
				});
				xhr.open("PUT", "https://api.trello.com/1/cards/" + itemChecklist.card_id + "/checkItem/" + itemChecklist.id, true);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.send(JSON.stringify(toSend));
			},

			updateBoard: function (obj, cb) {
				RestClient.post(model + "/update-board", obj, function (err, result) {
					cb(err, result);
				})
			}
		};

		return factory;

	}]);



}(angular));
