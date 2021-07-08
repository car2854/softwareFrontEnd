import { EventEmitter, Injectable } from '@angular/core';
import { FaceApiService } from './face-api.service';
import { Estudiante } from '../models/estudiante.model';
import { EstudianteService } from './estudiante.service';

@Injectable({
  providedIn: 'root'
})
export class VideoPlayService {

  cbAi: EventEmitter<any> = new EventEmitter<any>();

  private estudiante!: Estudiante;

  private globalFace:any;
  private labeledFaceDescriptors: any;

  constructor(
    private faceApiService: FaceApiService,
    private estudianteService: EstudianteService
  ) {
    this.estudiante = this.estudianteService.estudiante;
    this.globalFace = this.faceApiService.globalFace;
  }

  public getLandMark = async(videoElement:any) => {
    
    // const {globalFace} = this.faceApiService;
    const {videoWidth, videoHeight} = videoElement.nativeElement;
    const displaySize = {width:videoWidth, height:videoHeight}
    
    const detectionsFaces = await this.globalFace.detectAllFaces(videoElement.nativeElement, new this.globalFace.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = this.globalFace.resizeResults(detectionsFaces, displaySize)
    // console.log(resizedDetections);

    // this.cbAi.emit({
    //   resizedDetections,
    //   displaySize,
    // })
    
    // if (resizedDetections.descriptor){
      
      this.labeledFaceDescriptors = await this.loadLabeledImages();
    
      const faceMatcher = new this.globalFace.FaceMatcher(this.labeledFaceDescriptors, 0.6);
  
      const results = resizedDetections.map((d:any) => faceMatcher.findBestMatch(d.descriptor))
  
      // this.cargarImagenes();
  
      this.cbAi.emit({
        resizedDetections,
        displaySize,
        results
      })

    // }



    
  }

  public loadLabeledImages(){

    const labels = [this.estudiante.foto1,this.estudiante.foto2,this.estudiante.foto3];

    let i = 0;
    return Promise.all(

      labels.map(async resp => {
        const descriptions = []
        const img = await this.globalFace.fetchImage(resp);
        
        console.log(img);
        
        console.log(i);
        (i==2)? i=0:i++;
        
        this.cargarImagenes();
        
        const detections = await this.globalFace.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        
        
        descriptions.push(detections.descriptor)
        
        
        return new this.globalFace.LabeledFaceDescriptors(resp, descriptions)
      })

    )

  }


  public async cargarImagenes(){
    this.labeledFaceDescriptors = await this.loadLabeledImages();
  }

}