

import React from 'react';
import { StyleSheet, Text, View, Button, Image , TouchableOpacity} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { RNCamera } from 'react-native-camera';


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filePath: {},
      confirmation : "",
      isLoading : "",
      Invoice : "",
      Amount : "",
      Provider: "",
      Vendor : "",
      Description : "",
      fileUploaded : false
    };
  }

  async chooseFile () {
    let source;
    var options = {
      title: 'Select Image',
      customButtons: [
        { name: 'customOptionKey', title: 'Choose Photo from Custom Option' },
      ],
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, response => {
      this.setState({fileUploaded : false})
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
      //  console.log('User tapped custom button: ', response.customButton);
        alert(response.customButton);
      } else {
         source = response.data;
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };
        console.log("response Upload function------------", JSON.stringify(response))
        this.setState({
          filePath: response,
          confirmation : "Extracting data"
        });
      }
    
      this.uploadImage(source);
    });
  };

   async uploadImage (source){
     let encodedImage;
      const UID= Math.round(1+ Math.random() * (1000000-1));
     

      var date={
          fileExt:"png",
          imageID: UID,
          folder:UID,
          img : 'data:image/png;base64,' + source 
      };

      this.setState({confirmation : "Processing..."})
      let responseProd = await fetch(
          '',
          {
          method: "POST",
          headers: {
              Accept : "application/json",
              "Content-Type": "application.json"
          },
          body : JSON.stringify(date)
          }
      );
  
  
      if (responseProd.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        let json = await responseProd.json();
        console.log("json",json)
      } else {
        alert("HTTP-Error: " + responseProd.status);
      }
  
      let targetImage= UID + ".png";
      const responseOCR =await fetch(
          '',
          {
          method: "POST",
          headers: {
              Accept : "application/json",
              "Content-Type": "application.json"
          },
          body : JSON.stringify(targetImage)
          }
         
      );
      this.setState({confirmation : ""})
      if (responseOCR.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        let json;
        await responseOCR.json()
          .then((res) => {
         //   console.log("this", this)
            json = res.body[0];
            console.log("json.accountNumber",json)
            this.setState({Amount : json.accountNumber, Invoice :json.invoiceNumber , Provider : json.provider, fileUploaded : true})    
          })
        
      } else {
        alert("HTTP-Error: " + responseOCR.status);
        
      }
    }

    takePicture = async() => {
      if (this.camera) {
        const options = { quality: 0.5, base64: true };
        const data = await this.camera.takePictureAsync(options);
        console.log("response Camera function-----------------", JSON.stringify(data))
        console.log(data.uri);
        this.setState({
          filePath: data.uri,
          confirmation : "Extracting data"
        });
       this.uploadImage(data.base64);
      }
    };
  

  render() {
    console.log("heyyyy");
    let {Amount, Invoice, Provider} = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.container}>
        <Button title="Choose File" onPress={this.chooseFile.bind(this)} />
        <View style={styles.cameraContainer}>
      <RNCamera
        ref={ref => {
          this.camera = ref;
        }}
        style={styles.preview}
      />
      <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
        <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
          <Text style={{ fontSize: 14 }}> SNAP </Text>
        </TouchableOpacity>
      </View>
    </View>
        <View>
          <Image
            source={{ uri: this.state.filePath.uri }}
            style={{ width: 250, height: 250 ,  marginTop : 10}}
          />
          </View>
   
          <View style={styles.confirmView}>  
            <Text style={styles.confirmText}>
            {this.state.confirmation}
          </Text> 
          </View>

          {this.state.fileUploaded ? 
            (<View style={styles.confirmView}> 
            <Text> Amount : {Amount} </Text>
            <Text> Invoice : {Invoice} </Text>
            <Text> Provider : {Provider} </Text>
          </View> ) : null }
        </View>
      </View>
    )
      }
}
const styles = StyleSheet.create({
  container: {
   // flex: 1,
    flexDirection: 'column',
    padding : 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmView : {
    marginTop : 20
  },
  confirmText : {
    alignItems: 'center', color : 'red'
  },
  cameraContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  }
});