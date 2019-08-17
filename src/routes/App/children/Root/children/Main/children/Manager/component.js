import React from 'react'
import './component.scss'

import { Menu, Select, Dropdown, Modal, Upload, Button, message, Row, Col, Icon, Layout, Card } from 'antd';

import {
  Player, ControlBar, ReplayControl,
  ForwardControl, CurrentTimeDisplay,
  TimeDivider, PlaybackRateMenuButton, VolumeMenuButton
} from 'video-react';
// import reqwest from 'reqwest';

import UserManager from './children/UserManager'
import MonitoringManage from './children/MonitoringManage'
import LogListManage from './children/LogListManage'

import AddEquipment from './images/upper-bg.png'
import EgVideos from './images/videos.png'
import GroupAddition from './images/blue_add.png'
import EquipmentAddition from './images/yellow_add.png'
import RightBtn from './images/4.3.png'
import DownloadBtn from './images/3.4.png'
import ViewMore from './images/sidebar-viewmore.svg'
import File from './images/4.1.png'
import UploadFile from './images/4.2.png'
import Setting from './images/setting.png'
import WarningPicture from './images/warning.png'

const { SubMenu } = Menu;

const { Option } = Select;
const FILE_UPLOAD_ADDRESS = 'http://112.74.77.11:2019/shungkon/attach/upload'

const SRC_PATH = 'http://112.74.77.11:2019/shungkon'


// 格式化日期，如月、日、时、分、秒保证为2位数
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n;
}
// 参数number为毫秒时间戳，format为需要转换成的日期格式
function formatTime(number, format) {
  let time = new Date(number)
  let newArr = []
  let formatArr = ['Y', 'M', 'D', 'h', 'm', 's']
  newArr.push(time.getFullYear())
  newArr.push(formatNumber(time.getMonth() + 1))
  newArr.push(formatNumber(time.getDate()))

  newArr.push(formatNumber(time.getHours()))
  newArr.push(formatNumber(time.getMinutes()))
  newArr.push(formatNumber(time.getSeconds()))

  for (let i in newArr) {
    format = format.replace(formatArr[i], newArr[i])
  }
  return format;
}



let addGroupId = -1;
let moveGroupId = -1;
class Minitoring extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      iFrameHeight: '0px',
      isWindowShow: {
        isRealTimeShow: false,
        isEmergencyShow: false,
        isAnalysisShow: false,
        isLogListShow: false,
        isUpdateFirmwareShow: false,
        isUserManagerShow: false,
        isMinitoringManagerShow: false,

        isAdditionShow: true,

        isAdditionEquipmentShow: true,
        isAdditionGroupShow: false
      },

      // 分组操作数据
      editGroupVisibled: false,
      editGroupItem: null,
      deleteGroupVisibled: false,
      deleteGroupItem: null,

      // 设备操作数据
      editEquipmentVisibled: false,
      editEquipmentItem: null,
      deleteEquipmentVisibled: false,
      deleteEquipmentItem: null,
      moveEquipmentVisibled: false,
      moveEquipmentItem: null,

      fileList: [],
      uploading: false,
      clickMinitoring: {},
      isMinitoringClick: false,

      // 告警信息
      warningMessageDetails: [],
      warningDetailIndex: 0,

      // 密度分析
      densityList: [],
      densityDetailIndex: 0,


      myMinitoringGroup: [],
    }
    this.tempDeviceList = null;
    this.deviceDetail = null;
    this.tempUserList = null;
    this.tempLogList = null;

    this.fileInput = React.createRef();
    this.myForm = React.createRef();

    this.secondMenuHandle = this.secondMenuHandle.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.leftBottomShowOrHideHandle = this.leftBottomShowOrHideHandle.bind(this)
    this.additionShowHandle = this.additionShowHandle.bind(this)
    this.addGroupHandle = this.addGroupHandle.bind(this)
    this.addEquipmentHandle = this.addEquipmentHandle.bind(this)
    this.enterDeviceToSystem = this.enterDeviceToSystem.bind(this)
    this.getDeviceListByCondition = this.getDeviceListByCondition.bind(this)
    this.getDeviceDetail = this.getDeviceDetail.bind(this)
    this.checkSettingPsw = this.checkSettingPsw.bind(this)
    this.densityDetailHandle = this.densityDetailHandle.bind(this)
    this.getUserListByPhoneNum = this.getUserListByPhoneNum.bind(this)
    this.addUserInfo = this.addUserInfo.bind(this)
    this.deleteUserInfo = this.deleteUserInfo.bind(this)
    this.onGroupMenuClick = this.onGroupMenuClick.bind(this)
    this.changeLogList = this.changeLogList.bind(this)
    this.onEquipmentMenuClick = this.onEquipmentMenuClick.bind(this)
  }

  // 分组菜单按钮
  onGroupMenuClick = (item, e) => {
    e.domEvent.stopPropagation();
    console.log(item, 'wangyinbin')
    switch (e.key) {
      case '0':
        this.showEditGroupModal(item);
        break;
      case '1':
        this.showDeleteGroupModal(item);
        break;
      default:
        break;
    }
  };
  // 设备菜单按钮
  onEquipmentMenuClick = (item, group, e) => {
    e.domEvent.stopPropagation();
    switch (e.key) {
      case '0':
        this.showEditEquipmentModal(item);
        break;
      case '1':
        this.showMoveEquipmentModal(item, group)
        break;
      case '2':
        this.showDeleteEquipmentModal(item)
        break;
      default:
        break;
    }
  };

  // 修改密码确定按钮
  checkSettingPsw = e => {
    var oldPassword = document.getElementById('setting-old-psw').value
    var newPassword = document.getElementById('setting-new-psw').value
    var phoneNumber = this.phoneNumber

    var passwordReg = /(?!^\d+$)(?!^[A-Za-z]+$)(?!^[^A-Za-z0-9]+$)(?!^.*[\u4E00-\u9FA5].*$)^\S{8,20}$/

    if (oldPassword !== this.password) {
      alert('请输入正确的旧密码')
      return
    }
    if (oldPassword === newPassword) {
      alert('请勿输入与旧密码相同的密码')
      return
    }
    if (!passwordReg.test(newPassword)) {
      alert('请输入8-20位密码，字母/数字/符号至少2种')
      return
    }

    // 验证成功后登录
    this.props.modifyPassword({
      phoneNumber: phoneNumber,
      oldPassword: oldPassword,
      newPassword: newPassword,
    }, data => {
      alert('修改密码成功')

      var temp = this.state.isWindowShow
      temp.isSettingPswShow = !temp.isSettingPswShow
      this.setState({
        isWindowShow: temp
      })
    })
  }
  // 修改分组名称弹窗
  showEditGroupModal = (item, e) => {
    var groupId = item.groupId
    this.setState({
      editGroupVisibled: true,
      editGroupItem: { groupId: groupId }
    });
  };

  // 隐藏修改分组名称弹窗
  hideEditGroupModal = (item, bool, e) => {
    e.preventDefault();
    if (bool) {
      var groupName = document.getElementById('edit-group-name').value
      this.props.editGroupName({ groupId: item.groupId, groupName: groupName },
        data => {
          // userid 后期维护删除
          this.props.getDeviceGroup({ userId: '3' })
          addGroupId = -1
        }
      )
    }
    this.setState({
      editGroupVisibled: false,
      editGroupItem: null
    });
  };

  // 删除分组弹窗
  showDeleteGroupModal = (item, e) => {
    var groupId = item.groupId
    this.setState({
      deleteGroupVisibled: true,
      deleteGroupItem: { groupId: groupId }
    });
  };

  // 删除修改分组弹窗
  hideDeleteGroupModal = (item, bool, e) => {
    e.preventDefault();
    if (bool) {
      this.props.deleteGroupName({ groupId: item.groupId },
        data => {
          // userid 后期维护删除
          this.props.getDeviceGroup({ userId: '3' })
        }
      )
    }
    this.setState({
      deleteGroupVisibled: false,
      deleteGroupItem: null
    });
  };

  // 修改设备名称弹窗
  showEditEquipmentModal = (item, e) => {
    var deviceId = item.deviceId
    this.setState({
      editEquipmentVisibled: true,
      editEquipmentItem: { deviceId: deviceId }
    });
  };

  // 隐藏设备名称弹窗
  hideEditEquipmentModal = (item, bool, e) => {
    e.preventDefault();
    if (bool) {
      var deviceName = document.getElementById('edit-equipment-name').value
      this.props.editEquipmentName({ deviceId: item.deviceId, deviceName: deviceName },
        data => {
          // userid 后期维护删除
          this.props.getDeviceGroup({ userId: '3' })
        }
      )
    }
    this.setState({
      editEquipmentVisibled: false,
      editEquipmentItem: null
    });
  };

  // 移动分组弹窗
  showMoveEquipmentModal = (item, group, e) => {
    var deviceId = item.deviceId
    var groupId = group.groupId
    this.setState({
      moveEquipmentVisibled: true,
      moveEquipmentItem: { deviceId: deviceId, groupId: groupId }
    });
  };

  // 隐藏移动分组弹窗
  hideMoveEquipmentModal = (item, bool, e) => {
    e.preventDefault();
    if (bool) {
      if (item.deviceId !== moveGroupId) {
        this.props.moveEquipmentName({ deviceId: item.deviceId, groupId: item.groupId, newGroupId: moveGroupId },
          data => {
            // userid 后期维护删除
            moveGroupId = -1
            this.props.getDeviceGroup({ userId: '3' })
          }
        )
      } else {
        alert('请选择不同分组')
      }
    }
    this.setState({
      moveEquipmentVisibled: false,
      moveEquipmentItem: null
    });
  };

  // 删除设备弹窗
  showDeleteEquipmentModal = (item, e) => {
    var deviceId = item.deviceId
    this.setState({
      deleteEquipmentVisibled: true,
      deleteEquipmentItem: { deviceId: deviceId }
    });
  };

  // 删除修改设备弹窗
  hideDeleteEquipmentModal = (item, bool, e) => {
    e.preventDefault();
    if (bool) {
      this.props.deleteDeviceByRelation({ deviceId: item.deviceId },
        data => {
          // userid 后期维护删除
          this.props.getDeviceGroup({ userId: '3' })
        }
      )
    }
    this.setState({
      deleteEquipmentVisibled: false,
      deleteEquipmentItem: null
    });
  };

  // 录入设备信息
  enterDeviceToSystem = (params) => {
    this.props.addDeviceToSystem(params, data => {
      this.props.getFuzzyDeviceList({
        // serial: "w4324",
        serial: "",
        deviceType: "",
        produceDate: "",
        pageNo: 1,
        pageSize: 10
      }, data => {
        this.tempDeviceList = JSON.parse(JSON.stringify(data))
        this.setState({})
      })
    })
  }

  // 根据条件查询设备信息
  getDeviceListByCondition = (params) => {
    this.props.getFuzzyDeviceList({
      // serial: "w4324",
      serial: params.serial,
      deviceType: params.deviceType,
      produceDate: params.produceDate,
      pageNo: params.pageNo,
      pageSize: params.pageSize
    }, data => {
      this.tempDeviceList = JSON.parse(JSON.stringify(data))
      this.setState({})
    })
  }

  // 根据手机号码查询用户信息
  getUserListByPhoneNum = (params) => {
    this.props.getUserList({
      phoneNumber:params.phoneNumber || '',
      pageNo: params.pageNo,
      pageSize: params.pageSize
    }, data => {
      console.log(data, 'wangyinbin')
      this.tempUserList = JSON.parse(JSON.stringify(data))
      this.setState({})
    })
  }

  // 用户管理添加设备
  addUserInfo = (params) => {
    this.props.addUserDevice({
      phoneNumber: params.phoneNumber,
      serial: params.serial,
      deviceVertifyCode: params.deviceVertifyCode
    }, data => {
      console.log(data, 'wangyinbin')
      this.props.getUserList({
        phoneNumber: params.phoneNumber || '',
        pageNo: params.pageNo,
        pageSize: params.pageSize
      }, data => {
        console.log(data, 'wangyinbin')
        this.tempUserList = JSON.parse(JSON.stringify(data))
        this.setState({})
      })
    })
  }

  // 用户管理删除设备
  deleteUserInfo = (params) => {
    this.props.deleteUserDevice({
      phoneNumber: params.phoneNumber,
      serial: params.serial,
    }, data => {
      console.log(data, 'wangyinbin')
      this.props.getUserList({
        phoneNumber: params.phoneNumber || '',
        pageNo: params.pageNo,
        pageSize: params.pageSize
      }, data => {
        console.log(data, 'wangyinbin')
        this.tempUserList = JSON.parse(JSON.stringify(data))
        this.setState({})
      })
    })
  }

  getDeviceDetail = (deviceId) => {
    this.props.getDeviceDetails({ deviceId: deviceId }, data => {
      this.deviceDetail = JSON.parse(JSON.stringify(data))
      this.setState({})
    })
  }

  secondMenuHandle(item, e) {
    console.log(e, item)
  }

  editMinitoring(item, e) {
    console.log(item)
  }


  /** 添加分组列表下拉操作start */
  onChange(value) {
    if (value) {
      addGroupId = JSON.parse(JSON.stringify(value))
    }
    console.log(`selected ${value}`);
  }

  onBlur() {
    console.log('blur');
  }

  onFocus() {
    console.log('focus');
  }

  onSearch(val) {
    console.log('search:', val);
  }
  /** 添加分组列表下拉操作end */

  /** 移动设备分组列表下拉操作start */
  onMoveDeviceChange(value) {
    if (value) {
      moveGroupId = JSON.parse(JSON.stringify(value))
    }
    console.log(`selected ${value}`);
  }

  onMoveDeviceBlur() {
    console.log('blur');
  }

  onMoveDeviceFocus() {
    console.log('focus');
  }

  onMoveDeviceSearch(val) {
    console.log('search:', val);
  }
  /** 移动设备分组列表下拉操作end */

  // 添加分组确定按钮
  addGroupHandle = e => {
    var groupName = document.getElementById('add-group-input').value
    // userId 后期维护删除
    this.props.addGroup({ groupName: groupName, userId: '3' }, data => {
      alert('添加成功')
      this.props.getDeviceGroup({ userId: '3' })
    })
    var temp = this.state.isWindowShow
    temp.isAdditionGroupShow = false
    this.setState({
      isWindowShow: temp
    })
  }

  // 添加设备确定按钮
  addEquipmentHandle = e => {
    var serial = document.getElementById('add-equipment-product-num').value
    var code = document.getElementById('add-equipment-psw').value
    var groupId = addGroupId
    if (groupId !== -1) {
      this.props.addDevGroup({
        serial: serial,
        deviceVerifyCode: code,
        groupId: groupId
      }, data => {
        // userid 后期维护删除
        this.props.getDeviceGroup({ userId: '3' })
      })
    } else {
      alert('请选择分组')
      return
    }
    var temp = this.state.isWindowShow
    temp.isAdditionEquipmentShow = false
    this.setState({
      isWindowShow: temp
    })

  }

  // 控制添加设备/分组显示;修改密码显示
  additionShowHandle = (type, e) => {
    var temp = this.state.isWindowShow
    switch (type) {
      case 'group':
        temp.isAdditionGroupShow = !temp.isAdditionGroupShow;
        temp.isAdditionEquipmentShow = false;
        temp.isSettingPswShow = false;
        this.setState({
          isWindowShow: temp
        })
        break;
      case 'equipment':
        temp.isAdditionEquipmentShow = !temp.isAdditionEquipmentShow;
        temp.isAdditionGroupShow = false;
        temp.isSettingPswShow = false;
        this.setState({
          isWindowShow: temp
        })
        break;
      case 'setting':
        temp.isSettingPswShow = !temp.isSettingPswShow
        temp.isAdditionGroupShow = false;
        temp.isAdditionEquipmentShow = false;
        this.setState({
          isWindowShow: temp
        })
        break;
      default:
        break;
    }
  }

  // 告警信息详细信息切换
  warningDetailChangeHandle = index => {
    if (this.state.warningDetailIndex !== index) {
      this.setState({
        warningDetailIndex: index
      })
    }
  }

  // 密度分析详细信息切换
  densityDetailHandle = index => {
    if (this.setState.densityDetailIndex !== index) {
      this.setState({
        densityDetailIndex: index
      })
    }
  }

  handleClick(e) {
    var contentType = e.item.props.children
    var monitoringName = e.key
    var serial = monitoringName.split('-')[1]
    console.log(e, 'wangyinbinb');
    var isWindowShowCopy = this.state.isWindowShow
    switch (contentType) {
      case '实时视频':
        Object.keys(isWindowShowCopy).map((items, index) => {
          switch (items) {
            case 'isRealTimeShow':
              isWindowShowCopy[items] = true
              break;
            default:
              isWindowShowCopy[items] = false
              break;
          }
        })
        isWindowShowCopy.isAdditionGroupShow = false
        isWindowShowCopy.isAdditionEquipmentShow = false
        isWindowShowCopy.isSettingPswShow = false
        this.setState({
          isWindowShow: isWindowShowCopy
        })
        break;
      case '告警信息':

        // 请求告警信息数据
        this.props.getWarningVideos({ serial: serial }, data => {
          if (data.uglyData) {
            var temp = data.uglyData
            var detailsTemp = []
            temp.map((item, index) => {
              detailsTemp.push(Object.assign({}, item, { 'validDate': '一个月' }))
            })
            this.setState({
              warningMessageDetails: detailsTemp
            })
          }
        })
        Object.keys(isWindowShowCopy).map((items, index) => {
          switch (items) {
            case 'isEmergencyShow':
              isWindowShowCopy[items] = true
              break;
            default:
              isWindowShowCopy[items] = false
              break;
          }
        })
        isWindowShowCopy.isSettingPswShow = false
        isWindowShowCopy.isAdditionGroupShow = false
        isWindowShowCopy.isAdditionEquipmentShow = false
        this.setState({
          isWindowShow: isWindowShowCopy
        })
        break;
      case '密度分析':
        // 请求密度分析数据
        this.props.getDensityPicture({ serial: serial }, data => {
          if (data.uglyData) {
            var temp = data.uglyData
            var densityTempList = []
            temp.map((item, index) => {
              densityTempList.push({ 'path': item.densityPicturePath, 'validDate': formatTime(item.createTime, 'Y-M-D h:m:s') })
            })
            this.setState({
              densityList: densityTempList
            })
          }
        })
        Object.keys(isWindowShowCopy).map((items, index) => {
          switch (items) {
            case 'isAnalysisShow':
              isWindowShowCopy[items] = true
              break;
            default:
              isWindowShowCopy[items] = false
              break;
          }
        })
        isWindowShowCopy.isAdditionGroupShow = false
        isWindowShowCopy.isSettingPswShow = false
        isWindowShowCopy.isAdditionEquipmentShow = false
        this.setState({
          isWindowShow: isWindowShowCopy
        })
        break;
      case '日志列表':
        // 请求密度分析数据
        this.props.getLogList({
          serial: 'QSZ001',
          startTime: "",
          endTime: "",
          pageNo: 1,
          pageSize: 15
        }, data => {
          try {
            this.tempLogList = JSON.parse(JSON.stringify(data))
            this.setState({})
            // Do something that could throw
          } catch (error) {
            console.log(error)
          }

          // if (data.uglyData) {
          //   var temp = data.uglyData
          //   var LogListTemp = []
          //   temp.map((item, index) => {
          //     LogListTemp.push({ 'item': item })
          //   })
          //   this.setState({
          //     logList: LogListTemp
          //   })
          // }
        })
        Object.keys(isWindowShowCopy).map((items, index) => {
          switch (items) {
            case 'isLogListShow':
              isWindowShowCopy[items] = true
              break;
            default:
              isWindowShowCopy[items] = false
              break;
          }
        })
        this.setState({
          isWindowShow: isWindowShowCopy
        })
        break;
      default:
        break;
    }
  }

  changeLogList = (params) => {
    this.props.getLogList({
      serial: 'QSZ001',
      startTime: params.startTime,
      endTime: params.endTime,
      pageNo: params.pageNo,
      pageSize: params.pageSize
    }, data => {
      try {
        this.tempLogList = JSON.parse(JSON.stringify(data))
        this.setState({})
        // Do something that could throw
      } catch (error) {
        console.log(error)
      }
    })
  }

  // 导航栏下栏按钮操作
  leftBottomShowOrHideHandle(index) {
    var isWindowShowCopy = this.state.isWindowShow
    switch (index) {
      case '1':
        this.props.getUserList({
          phoneNumber: '',
          pageNo: 1,
          pageSize: 10
        }, data => {
          this.tempUserList = JSON.parse(JSON.stringify(data))
          this.setState({})
        })
        Object.keys(isWindowShowCopy).map((items, index) => {
          switch (items) {
            case 'isUserManagerShow':
              isWindowShowCopy[items] = true
              break;
            default:
              isWindowShowCopy[items] = false
              break;
          }
        })
        this.setState({
          isWindowShow: isWindowShowCopy
        })
        break;
      case '2':
        this.props.getFuzzyDeviceList({
          // serial: "w4324",
          serial: "",
          deviceType: "",
          produceDate: "",
          pageNo: 1,
          pageSize: 10
        }, data => {
          this.tempDeviceList = JSON.parse(JSON.stringify(data))
          this.setState({})
        })

        Object.keys(isWindowShowCopy).map((items, index) => {
          switch (items) {
            case 'isMinitoringManagerShow':
              isWindowShowCopy[items] = true
              break;
            default:
              isWindowShowCopy[items] = false
              break;
          }
        })
        this.setState({
          isMinitoringClick: true,
          isWindowShow: isWindowShowCopy
        })
        break;
      case '3':
        Object.keys(isWindowShowCopy).map((items, index) => {
          switch (items) {
            case 'isUpdateFirmwareShow':
              isWindowShowCopy[items] = true
              break;
            default:
              isWindowShowCopy[items] = false
              break;
          }
        })
        this.setState({
          isWindowShow: isWindowShowCopy

        })
        break;
      default:
        break;
    }
  }

  //上传文件
  handleUpload = () => {
    const { fileList } = this.state;
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('files[]', file);
    });

    this.setState({
      uploading: true,
    });
  };


  upload = (e) => {
    e.preventDefault();
    let formData = new FormData();
    formData.append("file", this.fileInput.current.files[0]);
    let request = new Request(FILE_UPLOAD_ADDRESS, {
      method: 'POST',
      // credentials: 'include',
      headers: {
        'Accept': '*',
      },
      contentType: 'multipart/form-data',
      body: formData,
      mode: 'cors'
    });
    fetch(request).then(res => res.text()).then(res =>
      JSON.parse(res).message ? alert(JSON.parse(res).message) : alert('上传失败'))
  };

  UNSAFE_componentWillMount() {
    // userid 后期维护删除
    this.props.getDeviceGroup({ userId: '3' })
  }

  UNSAFE_componentWillReceiveProps(props, state) {
    if (props.deviceGroup.devGroupList !== state.myMinitoringGroup) {
      this.setState({
        myMinitoringGroup: props.deviceGroup.devGroupList
      })
    }
  }

  render() {
    const { match, warningVideos } = this.props
    const { uploading,
      fileList,
      myMinitoringGroup,
      warningDetailIndex,
      densityList,
      densityDetailIndex } = this.state
    const props = {
      onRemove: file => {
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: file => {
        this.setState(state => ({
          fileList: [...state.fileList, file],
        }));
        return false;
      },
      fileList,
    };
    return (
      <div className="manager-component">
        <div className='minitoring-left-nav'>
          <div className='left-nav-mine'>
            <div className='nav-mine-title'>我的设备</div>
            <div className='nav-mine-list'>
              <div className='nav-mine-item'>
                <Menu
                  onClick={this.handleClick}
                  style={{ width: 256 }}
                  mode="inline"
                >
                  {
                    myMinitoringGroup && myMinitoringGroup.length !== 0 ? myMinitoringGroup.map((item, index) => {
                      return (
                        item.devGroup !== null && item.devGroup !== undefined ?
                          <SubMenu
                            key={index}
                            title={
                              <span style={{ width: '85%', overflow: 'hidden' }}>
                                <span title={item.devGroup.groupName} className=''>{` + ` + item.devGroup.groupName}</span>
                                <Dropdown overlay={
                                  <Menu onClick={this.onGroupMenuClick.bind(this, item.devGroup)}>
                                    <Menu.Item key="0">修改分组名称</Menu.Item>
                                    <Menu.Item key="1">删除</Menu.Item>
                                  </Menu>
                                } trigger={['click']}>
                                  <span className='group-right-btn' defineGroupId={`1`} defineGroupName={`ww`}><img className='group-right-img' alt='group-right-img' src={ViewMore}></img></span>
                                </Dropdown>
                              </span>
                            }

                          >
                            {
                              item.deviceList && item.deviceList.length !== 0 ? item.deviceList.map((items, indexs) => {
                                return (
                                  items !== null && item.devGroup !== null && item.devGroup !== undefined ?
                                    <SubMenu
                                      key={item.devGroup.groupName + items.deviceName}
                                      title={
                                        <span onClick={this.secondMenuHandle.bind(this, items)} style={{ height: '100%', display: 'block', width: '85%', overflow: 'hidden' }}>
                                          {/* <Icon type="appstore" /> */}
                                          <span title={items.deviceName}>{` + ` + items.deviceName}</span>
                                          <Dropdown overlay={
                                            <Menu onClick={this.onEquipmentMenuClick.bind(this, items, item.devGroup)}>
                                              <Menu.Item key="0">修改设备名称</Menu.Item>
                                              <Menu.Item key="1">移动分组</Menu.Item>
                                              <Menu.Item key="2">删除</Menu.Item>
                                            </Menu>
                                          } trigger={['click']}>
                                            <span className='group-right-btn'><img className='group-right-img' alt='group-right-img' src={ViewMore}></img></span>
                                          </Dropdown>
                                        </span>
                                      }
                                    >
                                      {/* <Menu.Item key={`${item.devGroup.groupName + '-' + items.serial}-1`}>实时视频</Menu.Item> */}
                                      <Menu.Item key={`${item.devGroup.groupName + '-' + items.serial}-2`}>告警信息</Menu.Item>
                                      <Menu.Item key={`${item.devGroup.groupName + '-' + items.serial}-3`}>密度分析</Menu.Item>
                                      <Menu.Item key={`${item.devGroup.groupName + '-' + items.serial}-4`}>日志列表</Menu.Item>
                                    </SubMenu> : null
                                )
                              }) : ''
                            }
                          </SubMenu> : null
                      )
                    }) : ''
                  }
                </Menu>
                {/* </div> */}
              </div>
              <Modal
                title="修改分组名称"
                visible={this.state.editGroupVisibled}
                onOk={this.hideEditGroupModal.bind(this, this.state.editGroupItem, true)}
                onCancel={this.hideEditGroupModal.bind(this, this.state.editGroupItem, false)}
                okText="确认"
                cancelText="取消"
              >
                <input placeholder='请输入分组名称' id='edit-group-name' className='ant-modal-input'></input>
              </Modal>
              <Modal
                title="删除分组"
                visible={this.state.deleteGroupVisibled}
                onOk={this.hideDeleteGroupModal.bind(this, this.state.deleteGroupItem, true)}
                onCancel={this.hideDeleteGroupModal.bind(this, this.state.deleteGroupItem, false)}
                okText="确认"
                cancelText="取消"
              >
                <p>确定删除该分组？</p>
              </Modal>
              <Modal
                title="修改设备名称"
                visible={this.state.editEquipmentVisibled}
                onOk={this.hideEditEquipmentModal.bind(this, this.state.editEquipmentItem, true)}
                onCancel={this.hideEditEquipmentModal.bind(this, this.state.editEquipmentItem, false)}
                okText="确认"
                cancelText="取消"
              >
                <input placeholder='请输入设备名称' id='edit-equipment-name' className='ant-modal-input'></input>
              </Modal>
              <Modal
                title="移动分组"
                visible={this.state.moveEquipmentVisibled}
                onOk={this.hideMoveEquipmentModal.bind(this, this.state.moveEquipmentItem, true)}
                onCancel={this.hideMoveEquipmentModal.bind(this, this.state.moveEquipmentItem, false)}
                okText="确认"
                cancelText="取消"
              >
                <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="请选择分组"
                  optionFilterProp="children"
                  onChange={this.onMoveDeviceChange}
                  onFocus={this.onMoveDeviceFocus}
                  onBlur={this.onMoveDeviceBlur}
                  onSearch={this.onMoveDeviceSearch}
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {
                    myMinitoringGroup && myMinitoringGroup.length !== 0 ? myMinitoringGroup.map((item, index) => {
                      return (
                        item.devGroup !== null && item.devGroup !== undefined ?
                          <Option value={item.devGroup.groupId} key={index}>{item.devGroup.groupName}</Option>
                          : null
                      )
                    }) : ''
                  }
                </Select>
              </Modal>
              <Modal
                title="删除设备"
                visible={this.state.deleteEquipmentVisibled}
                onOk={this.hideDeleteEquipmentModal.bind(this, this.state.deleteEquipmentItem, true)}
                onCancel={this.hideDeleteEquipmentModal.bind(this, this.state.deleteEquipmentItem, false)}
                okText="确认"
                cancelText="取消"
              >
                <p>确定删除该设备？</p>
              </Modal>
            </div>
          </div>
          <div className='left-bottom-nav'>
            <div className='left-nav-bottom-btn'>
              <div className='left-add-group-btn'>
                <img className='left-add-img' src={GroupAddition} alt='left-add-img' onClick={this.additionShowHandle.bind(this, 'group')}></img>
                <span className='left-add-group-title'>添加分组</span>
              </div>
              <div className='left-add-equipment-btn'>
                <img className='left-add-img' src={EquipmentAddition} alt='left-add-img' onClick={this.additionShowHandle.bind(this, 'equipment')}></img>
                <span className='left-add-equipment-title'>添加设备</span>
              </div>
              <img className='user-setting' alt='user-setting' src={Setting} onClick={this.additionShowHandle.bind(this, 'setting')}></img>
            </div>

            <div className='manager-left-btn'>
              <div className={`nav-manager-title ${this.state.isWindowShow.isUserManagerShow ? 'nav-manager-title-active' : ''}`} onClick={this.leftBottomShowOrHideHandle.bind(this, '1')}>用户管理</div>
              <div className={`nav-manager-title ${this.state.isWindowShow.isMinitoringManagerShow ? 'nav-manager-title-active' : ''}`} onClick={this.leftBottomShowOrHideHandle.bind(this, '2')}>设备管理</div>
              <div className={`nav-manager-title ${this.state.isWindowShow.isUpdateFirmwareShow ? 'nav-manager-title-active' : ''}`} onClick={this.leftBottomShowOrHideHandle.bind(this, '3')}>更新固件</div>
            </div>
          </div>
        </div>

        <div className='minitoring-right-content'>

          {/** 添加设备div
            *  isAdditionShow控制
            */}
          <div className={`add-equipment-content ${this.state.isWindowShow.isAdditionShow ? '' : 'hide'}`}>
            <img alt='add-equipment-img' className='add-equipment-img' src={AddEquipment}></img>
          </div>
          <div className='add-equipment-content'>
            <div className={`add-equipment-comfirm ${this.state.isWindowShow.isAdditionEquipmentShow ? '' : 'hide'}`}>
              <div className='add-equipment-form'>
                <span className='add-equipment-title'>添加设备</span>
                <input id='add-equipment-product-num' className='product-serial-number' placeholder='请输入产品序列号'></input>
                <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="请选择分组"
                  optionFilterProp="children"
                  onChange={this.onChange}
                  onFocus={this.onFocus}
                  onBlur={this.onBlur}
                  onSearch={this.onSearch}
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {
                    myMinitoringGroup && myMinitoringGroup.length !== 0 ? myMinitoringGroup.map((item, index) => {
                      return (
                        item.devGroup !== null && item.devGroup !== undefined ?
                          <Option value={item.devGroup.groupId} key={index}>{item.devGroup.groupName}</Option>
                          : null
                      )
                    }) : ''
                  }
                </Select>
                <input id='add-equipment-psw' className='product-psw' placeholder='请输入密码'></input>
                <span className='add-equipment-sure-btn' onClick={this.addEquipmentHandle.bind(this)}>确认</span>
              </div>
            </div>
            <div className={`add-equipment-comfirm ${this.state.isWindowShow.isAdditionGroupShow ? '' : 'hide'}`}>
              <div className='add-equipment-form'>
                <span className='add-equipment-title'>添加分组</span>
                <input id='add-group-input' className='product-serial-number' placeholder='请输入分组名称'></input>
                <span className='add-equipment-sure-btn' onClick={this.addGroupHandle.bind(this)}>确认</span>
              </div>
            </div>
            <div className={`add-equipment-comfirm ${this.state.isWindowShow.isSettingPswShow ? '' : 'hide'}`}>
              <div className='add-equipment-form'>
                <span className='add-equipment-title'>修改密码</span>
                <input id='setting-old-psw' className='product-serial-number' placeholder='请输入旧密码'></input>
                <input id='setting-new-psw' className='product-serial-number' placeholder='请输入新密码'></input>
                <span className='add-equipment-sure-btn' onClick={this.checkSettingPsw.bind(this)}>确认</span>
              </div>
            </div>
          </div>

          {/** 实时视频div
            *  isRealTimeShow控制
            */}
          <div className={`monitoring-detail-content real-time-content ${this.state.isWindowShow.isRealTimeShow ? '' : 'hide'}`}>
            <div className='minitoring-real-time-videos'>
              <div className='minitoring-real-time-videos-title'>
                <span className='real-time-title left-title'>设备1</span>
                <span className='real-time-title center-title'>实时视频</span>
                <span className='real-time-title right-title'></span>

              </div>

              <img className='real-time-videos-img' src={AddEquipment} alt='real-time-videos-img'></img>
            </div>
            <div className='minitoring-real-time-list'>
              <div className='real-time-list'>
                <div className='real-time-item'>
                  <img className='real-time-item-img' alt='real-time-item-img' src={AddEquipment}></img>
                  <span className='real-time-item-date'>2019-0730-17:30:00</span>
                  <img className='real-time-download-img' alt='real-time-download-img' src={DownloadBtn}></img>
                </div>
                <div className='real-time-item'>
                  <img className='real-time-item-img' alt='real-time-item-img' src={AddEquipment}></img>
                  <span className='real-time-item-date'>2019-0730-17:30:00</span>
                  <img className='real-time-download-img' alt='real-time-download-img' src={DownloadBtn}></img>
                </div>
                <div className='real-time-item'>
                  <img className='real-time-item-img' alt='real-time-item-img' src={AddEquipment}></img>
                  <span className='real-time-item-date'>2019-0730-17:30:00</span>
                  <img className='real-time-download-img' alt='real-time-download-img' src={DownloadBtn}></img>
                </div>
                <div className='real-time-item'>
                  <img className='real-time-item-img' alt='real-time-item-img' src={AddEquipment}></img>
                  <span className='real-time-item-date'>2019-0730-17:30:00</span>
                  <img className='real-time-download-img' alt='real-time-download-img' src={DownloadBtn}></img>
                </div>
                <div className='real-time-item'>
                  <img className='real-time-item-img' alt='real-time-item-img' src={AddEquipment}></img>
                  <span className='real-time-item-date'>2019-0730-17:30:00</span>
                  <img className='real-time-download-img' alt='real-time-download-img' src={DownloadBtn}></img>
                </div>
                <div className='real-time-item'>
                  <img className='real-time-item-img' alt='real-time-item-img' src={AddEquipment}></img>
                  <span className='real-time-item-date'>2019-0730-17:30:00</span>
                  <img className='real-time-download-img' alt='real-time-download-img' src={DownloadBtn}></img>
                </div>
              </div>
              {/* <img alt='real-time-right-btn' className='real-time-right-btn' src={RightBtn}></img> */}
            </div>
          </div>

          {/** 告警信息div
            *  isEmegencyShow控制
          */}
          <div className={`monitoring-detail-content emegency-message-content ${this.state.isWindowShow.isEmergencyShow ? '' : 'hide'}`}>

            <div className='emegency-left-content'>
              <div className='emegency-left-title'>告警信息</div>
              <div className='emegency-left-list'>
                <div className='emegency-left-list-box'>
                  {
                    warningVideos.uglyData && warningVideos.uglyData.length > 0 ? warningVideos.uglyData.map((item, index) => (
                      <div className='emegency-left-item' key={index} onClick={this.warningDetailChangeHandle.bind(this, index)}>
                        <span className='wd-span wd33'>{item.serial}</span>
                        {/* <span className='wd-span wd44'>{formatTime(item.createTime, 'Y-M-D h:m:s')}</span> */}
                        <span className='wd-span wd44'>{item.warningTime}</span>
                        <img src={WarningPicture} className='emegency-left-item-img' alt='emegency-left-item-img'></img>
                      </div>
                    ))
                      : ''
                  }
                </div>
              </div>
            </div>
            {
              this.state.warningMessageDetails.length > 0 ?
                <div>
                  <div className='emegency-right-top-videos'>
                    <div style={{ width: '100%', height: '100%' }}>
                      <Player>
                        <source src={SRC_PATH + this.state.warningMessageDetails[warningDetailIndex]['warningVideoPath']} />
                        {/* <source src={`file:///home/ftp123${this.state.warningMessageDetails[warningDetailIndex]['warningVideoPath']}`} /> */}
                        {/* <source src="http://peach.themazzone.com/durian/movies/sintel-1024-surround.mp4" /> */}
                        {/* <source src="http://mirrorblender.top-ix.org/movies/sintel-1024-surround.mp4" /> */}
                        <ControlBar>
                          <ReplayControl seconds={10} order={1.1} />
                          <ForwardControl seconds={30} order={1.2} />
                          <CurrentTimeDisplay order={4.1} />
                          <TimeDivider order={4.2} />
                          <PlaybackRateMenuButton
                            rates={[5, 2, 1, 0.5, 0.1]}
                            order={7.1}
                          />
                          <VolumeMenuButton disabled />
                        </ControlBar>
                      </Player>
                    </div>
                  </div>
                  <div className='emegency-right-bottom-message'>
                    <span className='right-bottom-message right-bottom-message-1'>详细信息： </span>
                    <span className='right-bottom-message right-bottom-message-2'>{this.state.warningMessageDetails[warningDetailIndex]['warningMessage']}</span>
                    <span className='right-bottom-message right-bottom-message-3'>有效期限：{this.state.warningMessageDetails[warningDetailIndex]['validDate']}</span>
                  </div>
                </div> :
                <div>
                  <div className='emegency-right-top-videos'>
                    <img src={WarningPicture} className='emegency-right-top-img' alt='emegency-right-top-img'></img>
                  </div>
                  <div className='emegency-right-bottom-message'>
                    <span className='right-bottom-message right-bottom-message-1'>详细信息： </span>
                    <span className='right-bottom-message right-bottom-message-2'>暂无</span>
                    <span className='right-bottom-message right-bottom-message-3'>有效期限：--</span>
                  </div>
                </div>
            }
          </div>

          {/** 密度分析div
            *  isAnalysisShow控制
          */}
          <div className={`monitoring-detail-content density-analysis-content ${this.state.isWindowShow.isAnalysisShow ? '' : 'hide'}`}>

            <div className='minitoring-density-analysis-videos'>
              <div className='minitoring-density-analysis-videos-title'>
                <span className='density-analysis-title left-title'></span>
                <span className='density-analysis-title center-title'>密度分析</span>
                <span className='density-analysis-title right-title'></span>
              </div>
              {
                densityList.length !== 0 ?
                  <img className='density-analysis-videos-img' src={SRC_PATH + densityList[densityDetailIndex].path} alt='density-analysis-videos-img'></img>
                  : null
              }
            </div>
            <div className='minitoring-density-analysis-list'>
              <div className='mimitoring-density-list'>
                {
                  densityList && densityList.length !== 0 ? densityList.map((item, index) => (
                    <div className='density-analysis-item' key={index} onClick={this.densityDetailHandle.bind(this, index)}>
                      <img className='density-analysis-item-img' alt='density-analysis-item-img' src={SRC_PATH + item.path}></img>
                      <span className='density-analysis-item-date'>{item.validDate}</span>
                    </div>
                  )) : ''
                }
              </div>
            </div>
          </div>

          {/** 日志管理div
            *  isLogListShow控制
           */}
          <div className={`monitoring-detail-content log-list-content ${this.state.isWindowShow.isLogListShow ? '' : 'hide'}`}>
            <LogListManage
              logManageList={this.tempLogList}
              changeLogList={this.changeLogList.bind(this)} />
          </div>

          {/** 更新固件
            *  isUpdateFirmwareShow控制
          */}
          <div className={`monitoring-detail-content update-firmware-content ${this.state.isWindowShow.isUpdateFirmwareShow ? '' : 'hide'}`}>
            <div className='firmware-title'>更新固件</div>
            <div className='firmware-content'>
              <img src={File} alt='firmware-content-file' className='firmware-content-file'></img>
              <span className='firmware-content-filename'>shangkang-2019.0731</span>
            </div>
            <div className='upload-content'>
              <form ref={this.myForm} method="post">
                <input type="file" name='file' ref={this.fileInput} />
                <input type="submit" value="上传" onClick={this.upload} />
              </form>
            </div>
          </div>


          {/** 用户管理
            *  isUserManagerShow控制
          */}
          <div className={`monitoring-detail-content user-manager-content ${this.state.isWindowShow.isUserManagerShow ? '' : 'hide'}`}>
            <UserManager
              userManagerList={this.tempUserList}
              getUserListByPhoneNum={this.getUserListByPhoneNum.bind(this)}
              addUserInfo={this.addUserInfo.bind(this)}
              deleteUserInfo={this.deleteUserInfo.bind(this)}
            />
          </div>


          {/** 设备管理
            *  isMinitoringManagerShow控制
          */}
          <div className={`monitoring-detail-content minitoring-manager-content ${this.state.isWindowShow.isMinitoringManagerShow ? '' : 'hide'}`}>
            <MonitoringManage
              clickMinitoring={this.tempDeviceList}
              deviceDetail={this.deviceDetail}
              enterDeviceToSystem={this.enterDeviceToSystem.bind(this)}
              getDeviceListByCondition={this.getDeviceListByCondition.bind(this)}
              getDeviceDetail={this.getDeviceDetail.bind(this)} />
          </div>
        </div>
      </div >
    )

  }
}
export default Minitoring
